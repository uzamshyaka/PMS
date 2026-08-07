<?php

namespace App\Http\Controllers\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->validated();

            if (! Auth::attempt($credentials)) {
                return api_response(
                    Response::$statusTexts[Response::HTTP_UNAUTHORIZED],
                    Response::HTTP_UNAUTHORIZED,
                    'Invalid credentials',
                    null,
                );
            }

            $request->session()->regenerate();

            return api_response(
                Response::$statusTexts[Response::HTTP_OK],
                Response::HTTP_OK,
                'Login successful',
                [
                    'user' => Auth::user(),
                ],
            );
        } catch (\Throwable $th) {
            return api_response(
                Response::$statusTexts[Response::HTTP_INTERNAL_SERVER_ERROR],
                Response::HTTP_INTERNAL_SERVER_ERROR,
                'An error occurred while logging in.Invalid Password or email address',
                null,
                $th->getMessage(),
            );
        }
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
