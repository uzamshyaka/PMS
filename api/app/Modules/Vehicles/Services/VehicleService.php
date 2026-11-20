<?php

namespace App\Modules\Vehicles\Services;

use App\Models\ListingReview;
use App\Models\Vehicle;
use App\Models\VehicleImage;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Modules\AuditLogs\Services\AuditLogger;
use App\Modules\Vehicles\Enums\VehicleAction;
use App\Modules\Vehicles\Enums\VehicleStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * All vehicle writes and lifecycle transitions. Every operation runs in a
 * transaction together with its review-history and audit entries.
 */
class VehicleService
{
    private const COLUMNS = [
        'ownerId' => 'owner_id', 'makeId' => 'make_id', 'modelId' => 'model_id', 'year' => 'year', 'title' => 'title',
        'description' => 'description', 'listingType' => 'listing_type', 'mileageKm' => 'mileage_km', 'priceKes' => 'price_kes',
        'fuel' => 'fuel', 'transmission' => 'transmission', 'bodyStyle' => 'body_style', 'engineCc' => 'engine_cc',
        'exteriorColour' => 'exterior_colour', 'interiorColour' => 'interior_colour', 'drivetrain' => 'drivetrain',
        'doors' => 'doors', 'seats' => 'seats', 'conditionGrade' => 'condition_grade', 'payment' => 'payment',
        'location' => 'location', 'conditionNotes' => 'condition_notes',
    ];

    /** Fields a listing must have before it can be reviewed or published. */
    private const REQUIRED_FOR_REVIEW = [
        'title', 'description', 'mileage_km', 'price_kes', 'fuel', 'transmission', 'body_style', 'engine_cc',
        'exterior_colour', 'drivetrain', 'doors', 'seats', 'condition_grade', 'payment', 'location',
    ];

    public function __construct(
        private readonly AuditLogger $audit,
        private readonly VehicleImageService $images,
    ) {}

    /** @param array<string, mixed> $data validated VehicleRequest data */
    public function create(array $data): Vehicle
    {
        return DB::transaction(function () use ($data) {
            $vehicle = new Vehicle($this->attributes($data));
            $vehicle->status = VehicleStatus::Draft;
            $vehicle->created_by = Auth::id();
            $vehicle->reference = 'TMP-'.Str::random(12);
            $vehicle->slug = 'tmp-'.Str::random(20);
            $vehicle->save();

            // Final reference first: the slug is built from it.
            $vehicle->reference = 'CS-'.(1000 + $vehicle->id);
            $vehicle->slug = $this->slug($vehicle);
            $vehicle->save();
            $this->syncRelations($vehicle, $data);
            $this->audit->log('created', 'Vehicles', "Vehicle {$vehicle->reference}", 'Created as draft');

            if ($data['intent'] === 'submit') {
                $this->transition($vehicle, VehicleAction::Submit);
            }

            return $vehicle->refresh();
        });
    }

    /** @param array<string, mixed> $data validated VehicleRequest data */
    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        return DB::transaction(function () use ($vehicle, $data) {
            $vehicle = Vehicle::whereKey($vehicle->id)->lockForUpdate()->firstOrFail();
            if (! VehicleAction::Edit->allowedFrom($vehicle->status)) {
                throw ValidationException::withMessages(['status' => ["A {$vehicle->status->label()} vehicle cannot be edited."]]);
            }

            $wasLive = in_array($vehicle->status, [VehicleStatus::Published, VehicleStatus::Unavailable], true);
            $vehicle->fill($this->attributes($data));
            $vehicle->slug = $this->slug($vehicle);
            $vehicle->save();
            $this->syncRelations($vehicle, $data);

            // A change to a live listing goes back to review, so unreviewed details never reach the website.
            if ($wasLive) {
                $this->moveToReview($vehicle, 'Updated a live listing; sent back for review');
            } elseif ($data['intent'] === 'submit') {
                $this->transition($vehicle, VehicleAction::Submit);
            } else {
                $this->audit->log('updated', 'Vehicles', "Vehicle {$vehicle->reference}", 'Updated');
            }

            return $vehicle->refresh();
        });
    }

    public function transition(Vehicle $vehicle, VehicleAction $action, ?string $reason = null): Vehicle
    {
        return DB::transaction(function () use ($vehicle, $action, $reason) {
            $vehicle = Vehicle::whereKey($vehicle->id)->lockForUpdate()->firstOrFail();
            $to = $action->to();

            if ($to === null || ! $action->allowedFrom($vehicle->status)) {
                throw ValidationException::withMessages(['action' => ["You cannot {$action->label()} a vehicle that is {$vehicle->status->label()}."]]);
            }
            if ($action === VehicleAction::Reject && mb_strlen(trim((string) $reason)) < 20) {
                throw ValidationException::withMessages(['reason' => ['Explain what must be corrected (at least 20 characters).']]);
            }
            if (in_array($action, [VehicleAction::Submit, VehicleAction::Approve], true)) {
                $this->assertComplete($vehicle);
            }

            $from = $vehicle->status;
            $vehicle->status = $to;
            if ($action === VehicleAction::Submit) {
                $vehicle->submitted_at = now();
            }
            if ($to === VehicleStatus::Published && $vehicle->published_at === null) {
                $vehicle->published_at = now();
            }
            $vehicle->save();

            if (in_array($action, [VehicleAction::Submit, VehicleAction::Approve, VehicleAction::Reject], true)) {
                $this->review($vehicle, match ($action) {
                    VehicleAction::Submit => 'submitted',
                    VehicleAction::Approve => 'approved',
                    default => 'rejected',
                }, $action === VehicleAction::Reject ? trim((string) $reason) : null);
            }

            $isReview = in_array($action, [VehicleAction::Approve, VehicleAction::Reject], true);
            $this->audit->log(
                $isReview ? ($action === VehicleAction::Approve ? 'approved' : 'rejected') : ($action === VehicleAction::Submit ? 'submitted' : 'status_changed'),
                $isReview ? 'Listing Reviews' : 'Vehicles',
                "Vehicle {$vehicle->reference}",
                "{$from->value} → {$to->value}",
            );

            return $vehicle;
        });
    }

    private function moveToReview(Vehicle $vehicle, string $details): void
    {
        $this->assertComplete($vehicle);
        $vehicle->forceFill(['status' => VehicleStatus::PendingApproval, 'submitted_at' => now()])->save();
        $this->review($vehicle, 'submitted');
        $this->audit->log('submitted', 'Vehicles', "Vehicle {$vehicle->reference}", $details);
    }

    private function review(Vehicle $vehicle, string $action, ?string $reason = null): void
    {
        ListingReview::create([
            'vehicle_id' => $vehicle->id,
            'action' => $action,
            'reason' => $reason,
            'actor_id' => Auth::id(),
            'actor_name' => Auth::user()->name ?? 'System',
        ]);
    }

    private function assertComplete(Vehicle $vehicle): void
    {
        $missing = array_values(array_filter(self::REQUIRED_FOR_REVIEW, fn ($column) => $vehicle->{$column} === null || $vehicle->{$column} === ''));
        $errors = [];
        if ($missing) {
            $errors['vehicle'] = ['Complete these details before review: '.implode(', ', array_map(fn ($c) => str_replace('_', ' ', $c), $missing)).'.'];
        }
        if (! $vehicle->images()->exists()) {
            $errors['images'] = ['Add at least one photograph before submitting for approval.'];
        }
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }

    /** @return array<string, mixed> */
    private function attributes(array $data): array
    {
        $attributes = [];
        foreach (self::COLUMNS as $key => $column) {
            if (array_key_exists($key, $data)) {
                $attributes[$column] = is_string($data[$key]) ? (trim($data[$key]) === '' ? null : trim($data[$key])) : $data[$key];
            }
        }
        if (($attributes['listing_type'] ?? null) === 'new') {
            $attributes['mileage_km'] = 0;
        }
        if (empty($attributes['title'])) {
            $make = VehicleMake::find($data['makeId'])?->name;
            $model = VehicleModel::find($data['modelId'])?->name;
            $attributes['title'] = trim("{$data['year']} {$make} {$model}");
        }

        return $attributes;
    }

    private function syncRelations(Vehicle $vehicle, array $data): void
    {
        $vehicle->features()->sync($data['featureIds'] ?? []);

        $vehicle->inspections()->delete();
        foreach ($data['inspections'] ?? [] as $i) {
            $vehicle->inspections()->create([
                'source' => $i['source'],
                'title' => $i['title'],
                'inspected_on' => $i['date'],
                'summary' => $i['summary'],
                'inspector' => $i['inspector'] ?? null,
                // "Verified" requires an independent source *and* evidence.
                'has_evidence' => $i['source'] === 'independently_verified' && ! empty($i['hasEvidence']),
            ]);
        }

        $this->syncImages($vehicle, $data['images'] ?? []);
    }

    /** @param list<array{id: int|string, isPrimary?: bool}> $wanted */
    private function syncImages(Vehicle $vehicle, array $wanted): void
    {
        $ids = array_map(fn ($i) => (int) $i['id'], $wanted);
        $available = VehicleImage::whereIn('id', $ids)
            ->where(fn ($q) => $q->where('vehicle_id', $vehicle->id)->orWhere(fn ($q) => $q->whereNull('vehicle_id')->where('uploaded_by', Auth::id())))
            ->get()->keyBy('id');

        if ($available->count() !== count(array_unique($ids))) {
            throw ValidationException::withMessages(['images' => ['One or more photos could not be found. Please upload them again.']]);
        }

        foreach ($vehicle->images()->whereNotIn('id', $ids)->get() as $removed) {
            $this->images->delete($removed);
        }

        $primary = collect($wanted)->search(fn ($i) => ! empty($i['isPrimary']));
        foreach ($ids as $order => $id) {
            $available[$id]->forceFill([
                'vehicle_id' => $vehicle->id,
                'sort_order' => $order,
                'is_primary' => $order === ($primary === false ? 0 : $primary),
            ])->save();
        }
    }

    private function slug(Vehicle $vehicle): string
    {
        $make = VehicleMake::find($vehicle->make_id)?->name;
        $model = VehicleModel::find($vehicle->model_id)?->name;

        return Str::slug("{$vehicle->year} {$make} {$model}").'-'.Str::lower($vehicle->reference);
    }
}
