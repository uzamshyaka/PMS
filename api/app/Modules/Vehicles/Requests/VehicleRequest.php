<?php

namespace App\Modules\Vehicles\Requests;

use App\Models\VehicleModel;
use App\Modules\Authentication\Enums\AdminPermission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Create/update payload (camelCase, matching the admin form). A draft needs
 * only owner, make, model and year; submitting for review needs everything,
 * including at least one photo.
 */
class VehicleRequest extends FormRequest
{
    public const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

    public const TRANSMISSIONS = ['Automatic', 'Manual'];

    public const BODY_STYLES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon'];

    public const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];

    public const GRADES = ['New', 'Excellent', 'Very good', 'Good', 'Fair'];

    public const PAYMENTS = ['cash', 'lipa-mdogo-mdogo'];

    public const LOCATIONS = ['Eldoret', 'Kisumu', 'Machakos', 'Mombasa', 'Nairobi', 'Nakuru', 'Thika'];

    public const SOURCES = ['owner_declared', 'admin_recorded', 'independently_verified'];

    public function authorize(): bool
    {
        return $this->user()->can(AdminPermission::ManageVehicles->value);
    }

    public function submitting(): bool
    {
        return $this->input('intent') === 'submit';
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $full = $this->submitting() ? 'required' : 'nullable';
        $year = (int) now()->format('Y') + 1;

        return [
            'intent' => ['required', Rule::in(['draft', 'save', 'submit'])],
            'ownerId' => ['required', 'integer', Rule::exists('owners', 'id')->where('status', 'active')],
            'makeId' => ['required', 'integer', Rule::exists('vehicle_makes', 'id')],
            'modelId' => ['required', 'integer', Rule::exists('vehicle_models', 'id')],
            'year' => ['required', 'integer', "between:1980,{$year}"],
            'title' => [$full, 'nullable', 'string', 'min:5', 'max:120'],
            'description' => [$full, 'nullable', 'string', 'min:20', 'max:5000'],
            'listingType' => ['required', Rule::in(['new', 'used'])],
            'mileageKm' => [$full, 'nullable', 'integer', 'min:0', 'max:2000000'],
            'priceKes' => [$full, 'nullable', 'integer', 'min:50000', 'max:1000000000'],
            'currency' => ['sometimes', Rule::in(['KES'])],
            'fuel' => [$full, 'nullable', Rule::in(self::FUELS)],
            'transmission' => [$full, 'nullable', Rule::in(self::TRANSMISSIONS)],
            'bodyStyle' => [$full, 'nullable', Rule::in(self::BODY_STYLES)],
            'engineCc' => [$full, 'nullable', 'integer', 'between:600,8000'],
            'exteriorColour' => [$full, 'nullable', 'string', 'max:40'],
            'interiorColour' => ['nullable', 'string', 'max:40'],
            'drivetrain' => [$full, 'nullable', Rule::in(self::DRIVETRAINS)],
            'doors' => [$full, 'nullable', 'integer', 'between:2,5'],
            'seats' => [$full, 'nullable', 'integer', 'between:2,9'],
            'conditionGrade' => [$full, 'nullable', Rule::in(self::GRADES)],
            'payment' => [$full, 'nullable', Rule::in(self::PAYMENTS)],
            'location' => [$full, 'nullable', Rule::in(self::LOCATIONS)],
            'conditionNotes' => ['nullable', 'string', 'max:2000'],
            'featureIds' => ['array', 'max:80'],
            'featureIds.*' => ['integer', 'distinct', Rule::exists('features', 'id')],
            'images' => [$this->submitting() ? 'required' : 'present', 'array', 'max:20'],
            'images.*.id' => ['required', 'distinct'],
            'images.*.isPrimary' => ['boolean'],
            'inspections' => ['array', 'max:20'],
            'inspections.*.source' => ['required', Rule::in(self::SOURCES)],
            'inspections.*.title' => ['required', 'string', 'max:120'],
            'inspections.*.date' => ['required', 'date', 'before_or_equal:today'],
            'inspections.*.summary' => ['required', 'string', 'max:500'],
            'inspections.*.inspector' => ['nullable', 'string', 'max:120'],
            'inspections.*.hasEvidence' => ['boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'images.required' => 'Add at least one photograph before submitting for approval.',
            'ownerId.exists' => 'Choose an active owner.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                // The model must belong to the chosen make.
                if ($this->filled(['makeId', 'modelId']) && ! VehicleModel::whereKey($this->integer('modelId'))->where('make_id', $this->integer('makeId'))->exists()) {
                    $validator->errors()->add('modelId', 'This model does not belong to the chosen make.');
                }
            },
        ];
    }
}
