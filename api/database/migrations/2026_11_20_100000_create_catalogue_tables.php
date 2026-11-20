<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Vehicle catalogue: makes, models (belong to a make) and features.
 * Rows are deactivated, never deleted, so vehicles keep their references.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_makes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80)->unique();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('vehicle_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('make_id')->constrained('vehicle_makes')->restrictOnDelete();
            $table->string('name', 80);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['make_id', 'name']);
        });

        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80)->unique();
            $table->string('category', 40)->index();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('features');
        Schema::dropIfExists('vehicle_models');
        Schema::dropIfExists('vehicle_makes');
    }
};
