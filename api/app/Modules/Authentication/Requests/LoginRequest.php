<?php

namespace App\Modules\Authentication\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Login is open to guests; credentials are checked by AuthService.
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Rate-limit key: one bucket per email + IP pair.
     */
    public function throttleKey(): string
    {
        return 'admin-login:'.Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
