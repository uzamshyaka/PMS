<?php

if (! function_exists('api_response')) {
    /**
     * Return a standardized API response.
     *
     * @param bool $status
     * @param int $code
     * @param string $message
     * @param mixed $data
     * @param mixed $error
     * @return \Illuminate\Http\JsonResponse
     */
    function api_response(string $status, int $code, string $message = '', $data = null, $error = null, $meta = null)
    {
        $response = [
            'status'  => $status,
            'code'    => $code,
            'message' => $message,
            'data'    => $data,
            'meta'    => $meta ?? null,
            'errors'  => $error,
            
        ];

        return response()->json($response, $code);
    }
}