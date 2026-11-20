<?php

namespace App\Modules\Owners\Requests;

use App\Modules\Authentication\Enums\AdminPermission;
use App\Modules\Vehicles\Requests\VehicleRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OwnerRequest extends FormRequest
{
    /** Kenyan mobile numbers: +254 7xx/1xx xxx xxx or 07xx/01xx xxx xxx. */
    public const KENYAN_PHONE = '/^(?:\+?254|0)[17]\d{8}$/';

    public function authorize(): bool
    {
        return $this->user()->can(AdminPermission::ManageVehicles->value);
    }

    /** Normalise phone numbers to +2547XXXXXXXX so duplicates are detected. */
    public static function normalisePhone(?string $phone): ?string
    {
        if ($phone === null || trim($phone) === '') {
            return null;
        }
        $digits = preg_replace('/[\s-]/', '', $phone);

        return preg_match(self::KENYAN_PHONE, $digits) ? '+254'.substr(preg_replace('/^(\+?254|0)/', '', $digits), 0, 9) : $digits;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'phone' => self::normalisePhone($this->input('phone')),
            'whatsapp' => self::normalisePhone($this->input('whatsapp')),
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $owner = $this->route('owner');

        return [
            'type' => ['required', Rule::in(['individual', 'business'])],
            'name' => ['required', 'string', 'max:120'],
            'contactPerson' => ['nullable', 'required_if:type,business', 'string', 'max:120'],
            'phone' => ['required', 'regex:/^\+254[17]\d{8}$/', Rule::unique('owners', 'phone')->ignore($owner?->id)],
            'whatsapp' => ['nullable', 'regex:/^\+254[17]\d{8}$/'],
            'email' => ['nullable', 'email', 'max:255'],
            'location' => ['required', Rule::in(VehicleRequest::LOCATIONS)],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a Kenyan number, e.g. +254 712 345 678.',
            'whatsapp.regex' => 'Enter a Kenyan number, e.g. +254 712 345 678.',
            'phone.unique' => 'Another owner already uses this phone number.',
            'contactPerson.required_if' => 'Enter a contact person for the business.',
        ];
    }

    /** @return array<string, mixed> */
    public function attributesForModel(): array
    {
        $d = $this->validated();

        return [
            'type' => $d['type'], 'name' => $d['name'], 'contact_person' => $d['contactPerson'] ?? null, 'phone' => $d['phone'],
            'whatsapp' => $d['whatsapp'] ?? null, 'email' => $d['email'] ?? null, 'location' => $d['location'],
            'status' => $d['status'], 'notes' => $d['notes'] ?? null,
        ];
    }
}
