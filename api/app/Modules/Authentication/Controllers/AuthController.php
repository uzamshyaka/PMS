<?php

namespace App\Modules\Authentication\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Authentication\Requests\LoginRequest;
use App\Modules\Authentication\Resources\AdminUserResource;
use App\Modules\Authentication\Services\AuthService;
use App\Support\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $auth) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->auth->login($request);

        return ApiResponse::success(new AdminUserResource($user), 'Login successful.');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->auth->logout($request);

        return ApiResponse::success(message: 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(new AdminUserResource($request->user()));
    }
}
