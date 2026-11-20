<?php

namespace App\Support\Http;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/**
 * Converts any exception thrown under /api/* into the standard envelope.
 *
 * Raw exception messages are only passed through for exceptions whose
 * message is written by application code for the client (validation,
 * authentication, authorization, explicit abort() calls). Everything
 * else gets a fixed message so SQL, file paths and class names never leak.
 */
final class ApiExceptionRenderer
{
    private const MESSAGES = [
        401 => 'Unauthenticated.',
        403 => 'You are not authorized to perform this action.',
        404 => 'The requested resource was not found.',
        405 => 'This method is not allowed for the requested resource.',
        419 => 'Your session has expired. Please refresh and try again.',
        429 => 'Too many requests. Please try again later.',
        500 => 'An unexpected error occurred. Please try again later.',
    ];

    public static function render(Throwable $e): JsonResponse
    {
        return match (true) {
            $e instanceof ValidationException => ApiResponse::validationError($e->errors(), $e->getMessage()),
            $e instanceof AuthenticationException => ApiResponse::unauthenticated(self::clientMessage($e, 401)),
            $e instanceof AuthorizationException => ApiResponse::forbidden(self::clientMessage($e, 403)),
            $e instanceof ModelNotFoundException => ApiResponse::notFound(self::MESSAGES[404]),
            $e instanceof HttpExceptionInterface => self::fromHttpException($e),
            default => ApiResponse::error(self::MESSAGES[500], 500),
        };
    }

    private static function fromHttpException(HttpExceptionInterface&Throwable $e): JsonResponse
    {
        $status = $e->getStatusCode();

        // 404s from route-model binding carry model class names; 5xx may carry internals.
        $message = in_array($status, [404, 429], true) || $status >= 500
            ? self::defaultMessage($status)
            : self::clientMessage($e, $status);

        return ApiResponse::error($message, $status, headers: $e->getHeaders());
    }

    private static function clientMessage(Throwable $e, int $status): string
    {
        $message = trim($e->getMessage());

        return $message !== '' && $message !== 'This action is unauthorized.'
            ? $message
            : self::defaultMessage($status);
    }

    private static function defaultMessage(int $status): string
    {
        return self::MESSAGES[$status] ?? 'The request could not be completed.';
    }
}
