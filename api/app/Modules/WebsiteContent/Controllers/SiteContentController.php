<?php

namespace App\Modules\WebsiteContent\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Authentication\Enums\AdminPermission;
use App\Modules\Vehicles\Services\VehicleImageService;
use App\Modules\WebsiteContent\Services\SiteContentService;
use App\Support\Http\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteContentController extends Controller
{
    public function __construct(private readonly SiteContentService $content) {}

    public function show(Request $request, string $section): JsonResponse
    {
        $this->authorizeSection($request, $section);

        return ApiResponse::success($this->content->get($section));
    }

    public function update(Request $request, string $section): JsonResponse
    {
        $this->authorizeSection($request, $section);
        $values = $request->validate(SiteContentService::rules($section));

        return ApiResponse::success($this->content->save($section, $values), 'Changes saved.');
    }

    /** Logo / sharing image upload (re-encoded and stored in the S3 bucket like vehicle photos). */
    public function uploadImage(Request $request, VehicleImageService $images): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp', 'max:8192']]);
        $stored = $images->encodeAndStore($request->file('file'), 'site');

        return ApiResponse::created(['url' => Storage::disk(VehicleImageService::disk())->url($stored['path'])], 'Image uploaded.');
    }

    /** Public website content (no settings, nothing internal). */
    public function publicContent(): JsonResponse
    {
        return ApiResponse::success(collect(SiteContentService::PUBLIC_SECTIONS)->mapWithKeys(fn ($s) => [$s => $this->content->get($s)]));
    }

    private function authorizeSection(Request $request, string $section): void
    {
        abort_unless(in_array($section, SiteContentService::SECTIONS, true), 404);
        $permission = $section === 'settings' ? AdminPermission::ManageSystemSettings : AdminPermission::ManageWebsiteContent;
        if (! $request->user()->can($permission->value)) {
            throw new AuthorizationException;
        }
    }
}
