<?php

namespace Tests\Unit\Support;

use App\Support\Http\ApiResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ApiResponseTest extends TestCase
{
    private const KEYS = ['success', 'message', 'data', 'meta', 'errors'];

    #[Test]
    public function success_uses_the_standard_envelope(): void
    {
        $response = ApiResponse::success(['id' => 1], 'Done.');
        $body = $response->getData(true);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame(self::KEYS, array_keys($body));
        $this->assertTrue($body['success']);
        $this->assertSame('Done.', $body['message']);
        $this->assertSame(['id' => 1], $body['data']);
        $this->assertNull($body['errors']);
    }

    #[Test]
    public function created_returns_201(): void
    {
        $response = ApiResponse::created(['id' => 5]);

        $this->assertSame(201, $response->getStatusCode());
        $this->assertTrue($response->getData(true)['success']);
    }

    #[Test]
    public function errors_use_the_same_envelope_with_correct_status_codes(): void
    {
        $cases = [
            [ApiResponse::validationError(['email' => ['Required.']]), 422],
            [ApiResponse::unauthenticated(), 401],
            [ApiResponse::forbidden(), 403],
            [ApiResponse::notFound(), 404],
            [ApiResponse::error('Failed.'), 500],
        ];

        foreach ($cases as [$response, $status]) {
            $body = $response->getData(true);

            $this->assertSame($status, $response->getStatusCode());
            $this->assertSame(self::KEYS, array_keys($body));
            $this->assertFalse($body['success']);
            $this->assertNull($body['data']);
        }

        $this->assertSame(
            ['email' => ['Required.']],
            ApiResponse::validationError(['email' => ['Required.']])->getData(true)['errors'],
        );
    }

    #[Test]
    public function paginated_includes_pagination_meta(): void
    {
        $paginator = new LengthAwarePaginator([['id' => 3], ['id' => 4]], total: 5, perPage: 2, currentPage: 2);

        $body = ApiResponse::paginated($paginator)->getData(true);

        $this->assertSame([['id' => 3], ['id' => 4]], $body['data']);
        $this->assertSame([
            'current_page' => 2,
            'per_page' => 2,
            'total' => 5,
            'last_page' => 3,
            'from' => 3,
            'to' => 4,
        ], $body['meta']['pagination']);
    }
}
