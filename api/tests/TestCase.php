<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public const TEST_DATABASE = 'carshowcase_test';

    /**
     * Fail fast, before RefreshDatabase runs, if the suite is not pointed at
     * the dedicated MySQL test database. Prevents wiping development data.
     */
    public function createApplication(): Application
    {
        $app = parent::createApplication();

        $connection = $app['config']->get('database.default');
        $driver = $app['config']->get("database.connections.{$connection}.driver");
        $database = $app['config']->get("database.connections.{$connection}.database");

        if ($driver !== 'mysql' || $database !== self::TEST_DATABASE) {
            throw new RuntimeException(sprintf(
                'Refusing to run tests: expected MySQL database [%s], got [%s] on driver [%s].',
                self::TEST_DATABASE,
                $database,
                $driver,
            ));
        }

        return $app;
    }

    /**
     * Mark the next requests as coming from the SPA so Sanctum starts a
     * session (stateful API), exactly as the Nuxt frontend does.
     */
    protected function fromFrontend(): static
    {
        $origin = rtrim(explode(',', (string) config('app.frontend_url'))[0], '/');

        return $this->withHeaders(['Origin' => $origin, 'Referer' => $origin.'/']);
    }
}
