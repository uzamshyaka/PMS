<?php

namespace Database\Seeders;

use App\Models\Feature;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Reference data: common makes/models in Kenya and vehicle features.
 * Idempotent (safe to re-run); never removes or renames existing entries.
 */
class CatalogueSeeder extends Seeder
{
    private const MAKES = [
        'Toyota' => ['Land Cruiser Prado', 'Land Cruiser 300', 'Corolla Cross', 'Harrier', 'Hilux', 'Fielder', 'RAV4', 'Vitz'],
        'Mercedes-Benz' => ['C-Class', 'E-Class', 'GLC', 'GLE'],
        'BMW' => ['X3', 'X5', '3 Series', '5 Series'],
        'Land Rover' => ['Range Rover Evoque', 'Range Rover Sport', 'Discovery', 'Defender'],
        'Audi' => ['A4', 'Q5', 'Q7'],
        'Mazda' => ['CX-5', 'Demio', 'Axela'],
        'Volkswagen' => ['Golf', 'Tiguan', 'Touareg'],
        'Lexus' => ['RX', 'LX', 'NX'],
        'Nissan' => ['X-Trail', 'Note', 'Navara'],
        'Subaru' => ['Forester', 'Outback', 'Impreza'],
        'Honda' => ['Vezel', 'CR-V', 'Fit'],
        'Mitsubishi' => ['Outlander', 'Pajero'],
        'Isuzu' => ['D-Max', 'MU-X'],
    ];

    private const FEATURES = [
        'Comfort' => ['Leather seats', 'Heated seats', 'Ventilated seats', 'Sunroof', 'Panoramic roof', 'Dual-zone climate control', 'Keyless entry', 'Power tailgate', 'Third-row seating'],
        'Technology' => ['Apple CarPlay', 'Android Auto', 'Navigation', 'Premium sound system', 'Head-up display', 'Digital instrument cluster', 'Wireless charging'],
        'Safety' => ['Reversing camera', '360° camera', 'Parking sensors', 'Lane keep assist', 'Adaptive cruise control', 'Blind spot monitoring', 'Hill descent control', 'ABS & stability control'],
        'Exterior' => ['Alloy wheels', 'LED headlights', 'Roof rails', 'Tow bar', 'Tinted windows'],
        'Performance' => ['All-wheel drive', '4WD with low range', 'Turbocharged engine', 'Sport mode', 'Differential lock', 'Hybrid drivetrain'],
    ];

    public function run(): void
    {
        DB::transaction(function () {
            foreach (self::MAKES as $makeName => $models) {
                $make = VehicleMake::firstOrCreate(['name' => $makeName]);
                foreach ($models as $model) {
                    VehicleModel::firstOrCreate(['make_id' => $make->id, 'name' => $model]);
                }
            }
            foreach (self::FEATURES as $category => $names) {
                foreach ($names as $name) {
                    Feature::firstOrCreate(['name' => $name], ['category' => $category]);
                }
            }
        });
    }
}
