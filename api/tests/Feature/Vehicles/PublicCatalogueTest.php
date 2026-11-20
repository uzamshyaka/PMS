<?php

namespace Tests\Feature\Vehicles;

use App\Models\Vehicle;
use App\Modules\Authentication\Enums\AdminRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\Concerns\BuildsShowroom;
use Tests\TestCase;

/** What the public website can see: only published listings, never owner or internal data. */
class PublicCatalogueTest extends TestCase
{
    use BuildsShowroom, RefreshDatabase;

    private int $published;

    private int $pending;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpShowroom();

        $manager = $this->staff(AdminRole::VehicleManager);
        $this->published = $this->submittedVehicle($manager);
        $this->pending = $this->submittedVehicle($manager, ['title' => '2021 Toyota Harrier Hidden', 'location' => 'Mombasa', 'payment' => 'cash']);
        $this->as($this->staff(AdminRole::Reviewer));
        $this->transition($this->published, 'approve')->assertOk();
        $this->app['auth']->forgetGuards();
    }

    #[Test]
    public function only_published_vehicles_are_listed(): void
    {
        $this->getJson('/api/v1/public/vehicles')
            ->assertOk()
            ->assertJsonPath('meta.pagination.total', 1)
            ->assertJsonPath('data.0.slug', Vehicle::find($this->published)->slug)
            ->assertJsonPath('data.0.make', 'Toyota')
            ->assertJsonPath('data.0.model', 'Harrier')
            ->assertJsonPath('data.0.variant', '2.0 Premium')
            ->assertJsonPath('data.0.engine', '2.0L')
            ->assertJsonPath('data.0.condition.notes', ['Minor scratch on rear bumper', 'Tyres 70%'])
            ->assertJsonPath('data.0.inspections.0.hasEvidence', true);

        $this->getJson('/api/v1/public/vehicles/'.Vehicle::find($this->pending)->slug)->assertNotFound();
    }

    #[Test]
    public function owner_and_internal_details_are_never_exposed(): void
    {
        $body = $this->getJson('/api/v1/public/vehicles/'.Vehicle::find($this->published)->slug)->assertOk()->getContent();

        foreach (['Jane Owner', '+254712345678', 'ownerId', 'ownerName', 'reference', 'createdBy', 'CS-10'] as $secret) {
            $this->assertStringNotContainsString($secret, $body, "Public response leaked: {$secret}");
        }
    }

    #[Test]
    public function public_filters_and_facets_use_only_published_data(): void
    {
        $this->getJson('/api/v1/public/vehicles?location=Mombasa')->assertJsonPath('meta.pagination.total', 0);
        $this->getJson('/api/v1/public/vehicles?payment=lipa-mdogo-mdogo&type=used&make=Toyota')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/public/vehicles?maxPrice=1000000')->assertJsonPath('meta.pagination.total', 0);
        $this->getJson('/api/v1/public/vehicles?sort=evil')->assertUnprocessable();

        $this->getJson('/api/v1/public/vehicles/facets')->assertOk()
            ->assertJsonPath('data.makes', ['Toyota'])
            ->assertJsonPath('data.locations', ['Nairobi']);
    }

    #[Test]
    public function homepage_featured_selection_is_respected(): void
    {
        $this->getJson('/api/v1/public/vehicles?featured=1')->assertJsonPath('meta.pagination.total', 1)->assertJsonPath('data.0.featured', false);

        $this->as($this->staff(AdminRole::SuperAdmin));
        $this->putJson('/api/v1/admin/content/homepage', [
            'heroEyebrow' => 'Quality cars.', 'heroTitle' => 'Drive', 'heroScript' => 'Excellence', 'heroSubtitle' => 'Hello', 'featuredVehicleIds' => [$this->published],
        ])->assertOk();
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/v1/public/vehicles?featured=1')->assertJsonPath('data.0.featured', true);
        $this->getJson('/api/v1/public/site')->assertJsonPath('data.homepage.heroSubtitle', 'Hello')->assertJsonMissingPath('data.settings');
    }
}
