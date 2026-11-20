<?php

namespace App\Models;

use App\Modules\Vehicles\Enums\VehicleStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'owner_id', 'make_id', 'model_id', 'year', 'title', 'description', 'listing_type', 'mileage_km', 'price_kes',
        'currency', 'fuel', 'transmission', 'body_style', 'engine_cc', 'exterior_colour', 'interior_colour',
        'drivetrain', 'doors', 'seats', 'condition_grade', 'payment', 'location', 'condition_notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => VehicleStatus::class,
            'submitted_at' => 'datetime',
            'published_at' => 'datetime',
            'year' => 'integer',
            'mileage_km' => 'integer',
            'price_kes' => 'integer',
        ];
    }

    /** Only listings that may appear on the public website. */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', VehicleStatus::Published);
    }

    /** @return BelongsTo<Owner, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    /** @return BelongsTo<VehicleMake, $this> */
    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'make_id');
    }

    /** @return BelongsTo<VehicleModel, $this> */
    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsToMany<Feature, $this> */
    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'vehicle_feature');
    }

    /** @return HasMany<VehicleImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(VehicleImage::class)->orderBy('sort_order');
    }

    /** @return HasMany<VehicleInspection, $this> */
    public function inspections(): HasMany
    {
        return $this->hasMany(VehicleInspection::class)->orderByDesc('inspected_on');
    }

    /** @return HasMany<ListingReview, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(ListingReview::class)->orderByDesc('created_at')->orderByDesc('id');
    }
}
