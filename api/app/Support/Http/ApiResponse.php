<?php

namespace App\Support\Http;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Symfony\Component\HttpFoundation\Response;

/**
 * Builds every API response in the approved envelope:
 * {success, message, data, meta, errors}.
 */
final class ApiResponse
{
    public static function success(
        mixed $data = null,
        string $message = 'Operation completed successfully.',
        int $status = Response::HTTP_OK,
        ?array $meta = null,
    ): JsonResponse {
        return self::make(true, $message, self::resolve($data), $meta, null, $status);
    }

    public static function created(mixed $data = null, string $message = 'Resource created successfully.'): JsonResponse
    {
        return self::success($data, $message, Response::HTTP_CREATED);
    }

    /**
     * @param  class-string<JsonResource>|null  $resource  Resource used to transform each item.
     */
    public static function paginated(
        LengthAwarePaginator $paginator,
        ?string $resource = null,
        string $message = 'Operation completed successfully.',
    ): JsonResponse {
        $items = $resource
            ? $resource::collection($paginator->items())->resolve()
            : $paginator->items();

        return self::success($items, $message, meta: [
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ]);
    }

    public static function error(
        string $message,
        int $status = Response::HTTP_INTERNAL_SERVER_ERROR,
        mixed $errors = null,
        array $headers = [],
    ): JsonResponse {
        return self::make(false, $message, null, null, $errors, $status, $headers);
    }

    /**
     * @param  array<string, array<int, string>>  $errors
     */
    public static function validationError(array $errors, string $message = 'The given data was invalid.'): JsonResponse
    {
        return self::error($message, Response::HTTP_UNPROCESSABLE_ENTITY, $errors);
    }

    public static function unauthenticated(string $message = 'Unauthenticated.'): JsonResponse
    {
        return self::error($message, Response::HTTP_UNAUTHORIZED);
    }

    public static function forbidden(string $message = 'You are not authorized to perform this action.'): JsonResponse
    {
        return self::error($message, Response::HTTP_FORBIDDEN);
    }

    public static function notFound(string $message = 'The requested resource was not found.'): JsonResponse
    {
        return self::error($message, Response::HTTP_NOT_FOUND);
    }

    private static function make(
        bool $success,
        string $message,
        mixed $data,
        ?array $meta,
        mixed $errors,
        int $status,
        array $headers = [],
    ): JsonResponse {
        return new JsonResponse([
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'meta' => $meta,
            'errors' => $errors,
        ], $status, $headers);
    }

    private static function resolve(mixed $data): mixed
    {
        return $data instanceof JsonResource ? $data->resolve() : $data;
    }
}
