<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Modules\Authentication\Resources\AdminUserResource;
use App\Support\Http\ApiResponse;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\Test;
use RuntimeException;
use Tests\TestCase;

/**
 * Every /api response, success or failure, uses {success, message, data, meta, errors}.
 * Routes are registered inside the tests only.
 */
class ExceptionRenderingTest extends TestCase
{
    use RefreshDatabase;

    private const ENVELOPE = ['success', 'message', 'data', 'meta', 'errors'];

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('api')->prefix('api/v1/__probe')->group(function () {
            Route::get('crash', fn () => throw new RuntimeException('secret internal detail /var/www/html'));
            Route::get('sql', fn () => throw new QueryException('mysql', 'select * from secret_table', [], new RuntimeException('SQLSTATE[42S02]')));
            Route::get('users/{user}', fn (User $user) => ApiResponse::success($user->only('id')));
            Route::get('forbidden', fn () => abort(403));
            Route::post('validate', fn () => request()->validate(['name' => 'required']));
            Route::get('paginated', fn () => ApiResponse::paginated(User::query()->orderBy('id')->paginate(2), AdminUserResource::class));
        });
    }

    #[Test]
    public function unknown_api_routes_return_a_404_envelope(): void
    {
        $this->getJson('/api/v1/does-not-exist')
            ->assertNotFound()
            ->assertExactJsonStructure(self::ENVELOPE)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'The requested resource was not found.');
    }

    #[Test]
    public function missing_models_do_not_leak_class_names(): void
    {
        $response = $this->getJson('/api/v1/__probe/users/999999')->assertNotFound();

        $this->assertStringNotContainsString('App\\Models', $response->getContent());
    }

    #[Test]
    public function validation_errors_return_422_with_field_errors(): void
    {
        $this->postJson('/api/v1/__probe/validate', [])
            ->assertUnprocessable()
            ->assertExactJsonStructure(['success', 'message', 'data', 'meta', 'errors' => ['name']])
            ->assertJsonPath('success', false)
            ->assertJsonPath('data', null);
    }

    #[Test]
    public function forbidden_returns_403_envelope(): void
    {
        $this->getJson('/api/v1/__probe/forbidden')
            ->assertForbidden()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'You are not authorized to perform this action.');
    }

    #[Test]
    public function server_errors_hide_exception_details_even_in_debug_mode(): void
    {
        config(['app.debug' => true]);

        foreach (['crash', 'sql'] as $path) {
            $response = $this->getJson("/api/v1/__probe/{$path}")
                ->assertStatus(500)
                ->assertExactJson([
                    'success' => false,
                    'message' => 'An unexpected error occurred. Please try again later.',
                    'data' => null,
                    'meta' => null,
                    'errors' => null,
                ]);

            $body = $response->getContent();
            $this->assertStringNotContainsString('secret', $body);
            $this->assertStringNotContainsString('SQLSTATE', $body);
            $this->assertStringNotContainsString('trace', $body);
        }
    }

    #[Test]
    public function wrong_http_method_returns_405_envelope(): void
    {
        $this->deleteJson('/api/v1/admin/auth/me')
            ->assertStatus(405)
            ->assertJsonPath('success', false);
    }

    #[Test]
    public function paginated_responses_include_pagination_meta(): void
    {
        User::factory()->count(3)->create();

        $this->getJson('/api/v1/__probe/paginated?page=2')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.pagination.current_page', 2)
            ->assertJsonPath('meta.pagination.total', 3)
            ->assertJsonPath('meta.pagination.last_page', 2)
            ->assertJsonMissingPath('data.0.password');
    }

    #[Test]
    public function web_routes_keep_default_rendering(): void
    {
        $this->get('/definitely-missing-page')
            ->assertNotFound()
            ->assertHeader('content-type', 'text/html; charset=UTF-8');
    }
}
