<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Customer enquiries from the website, their status history and internal notes. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name', 120);
            $table->string('phone', 20);
            $table->string('email')->nullable();
            $table->text('message');
            $table->string('status', 20)->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });

        Schema::create('enquiry_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enquiry_id')->constrained('enquiries')->cascadeOnDelete();
            $table->string('status', 20);
            $table->string('note', 500)->nullable();
            $table->string('changed_by', 120);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('enquiry_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enquiry_id')->constrained('enquiries')->cascadeOnDelete();
            $table->text('body');
            $table->string('author', 120);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enquiry_notes');
        Schema::dropIfExists('enquiry_status_history');
        Schema::dropIfExists('enquiries');
    }
};
