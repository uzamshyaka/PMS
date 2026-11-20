<?php

namespace App\Modules\Vehicles\Services;

use App\Models\VehicleImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Stores vehicle photos safely: the upload is decoded and re-encoded as WebP
 * (dropping EXIF/GPS data and anything that is not a real image), resized to
 * a maximum edge, and saved under a random name on the vehicle-images disk
 * (an S3 bucket). Photos are uploaded first
 * (vehicle_id = null) and attached when the vehicle is saved.
 */
class VehicleImageService
{
    public const MAX_EDGE = 2400;

    public const QUALITY = 82;

    public static function disk(): string
    {
        return (string) config('filesystems.vehicle_images_disk', 's3');
    }

    public function store(UploadedFile $file): VehicleImage
    {
        $stored = $this->encodeAndStore($file, 'vehicles');

        return VehicleImage::create([
            ...$stored,
            'original_name' => mb_substr($file->getClientOriginalName(), 0, 255),
            'uploaded_by' => Auth::id(),
        ]);
    }

    /**
     * Decode, resize and re-encode an uploaded image as WebP and put it in the bucket.
     *
     * @return array{path: string, size: int, width: int, height: int}
     */
    public function encodeAndStore(UploadedFile $file, string $folder): array
    {
        $source = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));
        if ($source === false) {
            throw ValidationException::withMessages(['files' => ["{$file->getClientOriginalName()} is not a readable image."]]);
        }

        [$width, $height] = [imagesx($source), imagesy($source)];
        $scale = min(1, self::MAX_EDGE / max($width, $height));
        $targetW = max(1, (int) round($width * $scale));
        $targetH = max(1, (int) round($height * $scale));

        $canvas = imagecreatetruecolor($targetW, $targetH);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $targetW, $targetH, $width, $height);

        ob_start();
        imagewebp($canvas, null, self::QUALITY);
        $bytes = (string) ob_get_clean();
        imagedestroy($source);
        imagedestroy($canvas);

        $path = $folder.'/'.now()->format('Y/m').'/'.Str::uuid().'.webp';
        Storage::disk(self::disk())->put($path, $bytes, ['visibility' => 'public', 'ContentType' => 'image/webp', 'CacheControl' => 'public, max-age=31536000, immutable']);

        return ['path' => $path, 'size' => strlen($bytes), 'width' => $targetW, 'height' => $targetH];
    }

    public function delete(VehicleImage $image): void
    {
        Storage::disk(self::disk())->delete($image->path);
        $image->delete();
    }
}
