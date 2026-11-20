<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Vehicles and everything that belongs to one: features, photos, inspection
 * records and the append-only review (approval) history.
 *
 * Choice columns are nullable because drafts may be incomplete; the API
 * requires them before a listing can be submitted for review.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique();
            $table->string('slug', 160)->unique();
            $table->foreignId('owner_id')->constrained('owners')->restrictOnDelete();
            $table->foreignId('make_id')->constrained('vehicle_makes')->restrictOnDelete();
            $table->foreignId('model_id')->constrained('vehicle_models')->restrictOnDelete();
            $table->unsignedSmallInteger('year');
            $table->string('title', 120);
            $table->text('description')->nullable();
            $table->string('listing_type', 10)->default('used'); // new | used
            $table->unsignedInteger('mileage_km')->nullable();
            $table->unsignedBigInteger('price_kes')->nullable();
            $table->char('currency', 3)->default('KES');
            $table->string('fuel', 20)->nullable();
            $table->string('transmission', 20)->nullable();
            $table->string('body_style', 20)->nullable();
            $table->unsignedSmallInteger('engine_cc')->nullable();
            $table->string('exterior_colour', 40)->nullable();
            $table->string('interior_colour', 40)->nullable();
            $table->string('drivetrain', 10)->nullable();
            $table->unsignedTinyInteger('doors')->nullable();
            $table->unsignedTinyInteger('seats')->nullable();
            $table->string('condition_grade', 20)->nullable();
            $table->string('payment', 20)->nullable(); // cash | lipa-mdogo-mdogo
            $table->string('location', 60)->nullable();
            $table->text('condition_notes')->nullable();
            $table->string('status', 20)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'published_at']);
            $table->index(['status', 'make_id']);
            $table->index(['status', 'price_kes']);
            $table->index(['status', 'listing_type']);
            $table->index('location');
        });

        Schema::create('vehicle_feature', function (Blueprint $table) {
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('feature_id')->constrained()->restrictOnDelete();
            $table->primary(['vehicle_id', 'feature_id']);
        });

        Schema::create('vehicle_images', function (Blueprint $table) {
            $table->id();
            // Null until the vehicle is saved: photos are uploaded first, then attached.
            $table->foreignId('vehicle_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('original_name');
            $table->unsignedInteger('size');
            $table->unsignedSmallInteger('width');
            $table->unsignedSmallInteger('height');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['vehicle_id', 'sort_order']);
        });

        Schema::create('vehicle_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('source', 30); // owner_declared | admin_recorded | independently_verified
            $table->string('title', 120);
            $table->date('inspected_on');
            $table->string('summary', 500);
            $table->string('inspector', 120)->nullable();
            $table->boolean('has_evidence')->default(false);
            $table->timestamps();
        });

        Schema::create('listing_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('action', 20); // submitted | approved | rejected
            $table->text('reason')->nullable();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_name', 120);
            $table->timestamp('created_at')->useCurrent();
            $table->index(['vehicle_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_reviews');
        Schema::dropIfExists('vehicle_inspections');
        Schema::dropIfExists('vehicle_images');
        Schema::dropIfExists('vehicle_feature');
        Schema::dropIfExists('vehicles');
    }
};
