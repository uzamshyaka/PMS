<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Vehicle owners (individuals or businesses). Owners never log in; their details are internal only. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('owners', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20); // individual | business
            $table->string('name', 120);
            $table->string('contact_person', 120)->nullable();
            $table->string('phone', 20)->unique(); // normalised to +2547XXXXXXXX
            $table->string('whatsapp', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('location', 60);
            $table->string('status', 20)->default('active')->index();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('owners');
    }
};
