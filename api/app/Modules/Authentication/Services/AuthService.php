<?php

namespace App\Modules\Authentication\Services;

use App\Models\User;
use App\Modules\Authentication\Requests\LoginRequest;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public const MAX_ATTEMPTS = 5;

    public const DECAY_SECONDS = 60;

    private const GUARD = 'web';

    /**
     * Authenticate an administrator into the session guard.
     *
     * @throws ThrottleRequestsException when the email+IP bucket is exhausted
     * @throws ValidationException on bad credentials (generic, does not reveal whether the email exists)
     * @throws AuthorizationException when the account is deactivated
     */
    public function login(LoginRequest $request): User
    {
        $key = $request->throttleKey();

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            throw new ThrottleRequestsException(
                headers: ['Retry-After' => RateLimiter::availableIn($key)],
            );
        }

        $guard = Auth::guard(self::GUARD);
        $credentials = $request->only('email', 'password');

        if (! $guard->validate($credentials)) {
            RateLimiter::hit($key, self::DECAY_SECONDS);

            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        /** @var User $user */
        $user = $guard->getLastAttempted();

        if (! $user->is_active) {
            throw new AuthorizationException('This account has been deactivated. Contact a Super Admin.');
        }

        $guard->login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        RateLimiter::clear($key);

        $user->forceFill(['last_login_at' => now()])->save();

        return $user;
    }

    public function logout(Request $request): void
    {
        Auth::guard(self::GUARD)->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }
}
