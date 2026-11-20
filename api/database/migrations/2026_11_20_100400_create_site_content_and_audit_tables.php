<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per editable section (homepage, about, contact, branding, seo, settings).
        Schema::create('site_content', function (Blueprint $table) {
            $table->id();
            $table->string('section', 40)->unique();
            $table->json('values');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Append-only. user_name is a snapshot so entries survive user changes.
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name', 120);
            $table->string('action', 40)->index();
            $table->string('module', 40)->index();
            $table->string('entity', 120)->index();
            $table->string('details', 500);
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('site_content');
    }
};
