<?php

namespace App\Modules\WebsiteContent\Services;

use App\Models\SiteContent;
use App\Modules\AuditLogs\Services\AuditLogger;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Editable website content and system settings, one JSON document per
 * section. Missing keys fall back to the defaults below.
 */
class SiteContentService
{
    public const PUBLIC_SECTIONS = ['homepage', 'about', 'contact', 'branding', 'seo'];

    public const SECTIONS = [...self::PUBLIC_SECTIONS, 'settings'];

    public function __construct(private readonly AuditLogger $audit) {}

    /** @return array<string, mixed> */
    public function get(string $section): array
    {
        $stored = SiteContent::where('section', $section)->value('values') ?? [];

        return array_replace(self::defaults()[$section] ?? [], is_array($stored) ? $stored : []);
    }

    /** @param array<string, mixed> $values */
    public function save(string $section, array $values): array
    {
        return DB::transaction(function () use ($section, $values) {
            $merged = array_replace($this->get($section), $values);
            SiteContent::updateOrCreate(['section' => $section], ['values' => $merged, 'updated_by' => Auth::id()]);
            $this->audit->log('updated', $section === 'settings' ? 'Settings' : 'Website', $section, 'Content updated');

            return $merged;
        });
    }

    /** @return array<string, array<string, mixed>> */
    public static function defaults(): array
    {
        return [
            'homepage' => ['heroEyebrow' => 'Quality cars. Trusted service.', 'heroTitle' => 'Drive', 'heroScript' => 'Excellence', 'heroSubtitle' => 'Discover quality vehicles selected for your next journey.', 'featuredVehicleIds' => []],
            'about' => ['title' => 'Quality vehicles, clearly presented', 'intro' => 'Car Showcase presents quality vehicles with the information buyers actually need.', 'body' => 'Our team prepares and reviews every listing before it goes live, so what you see online is what you will find in the showroom.'],
            'contact' => ['phone' => '+254 700 000 000', 'whatsapp' => '254700000000', 'email' => 'hello@carshowcase.example', 'address' => 'Showroom address, Nairobi, Kenya', 'hours' => 'Mon–Sat, 8:00 – 18:00'],
            'branding' => ['siteName' => 'Car Showcase', 'tagline' => 'Quality Vehicles', 'accentColour' => '#b08d57', 'logoUrl' => ''],
            'seo' => ['metaTitle' => 'Car Showcase: Quality Cars, Trusted Service', 'metaDescription' => 'Browse new and used vehicles in Kenya. Cash and Lipa Mdogo Mdogo options. Contact our showroom team directly.', 'ogImageUrl' => ''],
            'settings' => ['siteName' => 'Car Showcase', 'timezone' => 'Africa/Nairobi', 'currency' => 'KES', 'currencySymbol' => 'KES', 'priceDecimals' => 0, 'contactEmail' => 'hello@carshowcase.example', 'contactPhone' => '+254 700 000 000', 'listingsPerPage' => 9, 'showSoldVehicles' => false, 'maxImageSizeMb' => 8, 'maxImagesPerVehicle' => 20, 'allowedImageTypes' => 'JPEG, PNG, WebP'],
        ];
    }

    /** @return array<string, mixed> */
    public static function rules(string $section): array
    {
        $image = ['nullable', 'string', 'max:2048', 'regex:/^(https?:\/\/|\/)/'];

        return match ($section) {
            'homepage' => [
                'heroEyebrow' => ['required', 'string', 'max:60'], 'heroTitle' => ['required', 'string', 'max:20'],
                'heroScript' => ['required', 'string', 'max:20'], 'heroSubtitle' => ['required', 'string', 'max:120'],
                'featuredVehicleIds' => ['array', 'max:24'], 'featuredVehicleIds.*' => ['integer', 'exists:vehicles,id'],
            ],
            'about' => ['title' => ['required', 'string', 'max:80'], 'intro' => ['required', 'string', 'max:300'], 'body' => ['required', 'string', 'max:2000']],
            'contact' => [
                'phone' => ['required', 'string', 'max:20'], 'whatsapp' => ['required', 'regex:/^\d{9,15}$/'],
                'email' => ['required', 'email', 'max:255'], 'address' => ['required', 'string', 'max:200'], 'hours' => ['required', 'string', 'max:60'],
            ],
            'branding' => ['siteName' => ['required', 'string', 'max:40'], 'tagline' => ['nullable', 'string', 'max:40'], 'accentColour' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'], 'logoUrl' => $image],
            'seo' => ['metaTitle' => ['required', 'string', 'max:60'], 'metaDescription' => ['required', 'string', 'max:160'], 'ogImageUrl' => $image],
            'settings' => [
                'siteName' => ['required', 'string', 'max:40'], 'timezone' => ['required', 'in:Africa/Nairobi'], 'currency' => ['required', 'in:KES'],
                'currencySymbol' => ['required', 'string', 'max:5'], 'priceDecimals' => ['required', 'integer', 'between:0,2'],
                'contactEmail' => ['required', 'email'], 'contactPhone' => ['nullable', 'string', 'max:20'],
                'listingsPerPage' => ['required', 'integer', 'between:6,48'], 'showSoldVehicles' => ['required', 'boolean'],
                'maxImageSizeMb' => ['required', 'integer', 'between:1,20'], 'maxImagesPerVehicle' => ['required', 'integer', 'between:1,50'],
                'allowedImageTypes' => ['required', 'in:JPEG, PNG, WebP'],
            ],
        };
    }
}
