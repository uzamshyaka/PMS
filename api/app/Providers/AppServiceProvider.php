<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Default limiter for every /api route (applied via throttleApi() in bootstrap/app.php).
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute((int) config('app.api_rate_limit', 60))
                ->by($request->user()?->id ?: $request->ip());
        });

        // Public enquiry form: 5 per hour per IP.
        RateLimiter::for('enquiries', fn (Request $request) => Limit::perHour(5)->by('enquiry:'.$request->ip()));
    }
}
