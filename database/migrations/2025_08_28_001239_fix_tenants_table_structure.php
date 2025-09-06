<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Ensure tenant table has all required SaaS fields
        Schema::table('tenants', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('tenants', 'name')) {
                $table->string('name')->after('id');
            }
            if (!Schema::hasColumn('tenants', 'slug')) {
                $table->string('slug')->unique()->after('name');
            }
            if (!Schema::hasColumn('tenants', 'description')) {
                $table->text('description')->nullable()->after('slug');
            }
            if (!Schema::hasColumn('tenants', 'plan')) {
                $table->string('plan')->default('basic')->after('description');
            }
            if (!Schema::hasColumn('tenants', 'max_users')) {
                $table->integer('max_users')->default(10)->after('plan');
            }
            if (!Schema::hasColumn('tenants', 'max_courses')) {
                $table->integer('max_courses')->default(5)->after('max_users');
            }
            if (!Schema::hasColumn('tenants', 'max_storage_mb')) {
                $table->bigInteger('max_storage_mb')->default(100)->after('max_courses');
            }
            if (!Schema::hasColumn('tenants', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('max_storage_mb');
            }
            if (!Schema::hasColumn('tenants', 'trial_ends_at')) {
                $table->timestamp('trial_ends_at')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('tenants', 'subscription_ends_at')) {
                $table->timestamp('subscription_ends_at')->nullable()->after('trial_ends_at');
            }
        });
    }

    public function down()
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Re-add the columns if we need to rollback
            $table->string('name')->nullable();
            $table->string('slug')->unique()->nullable();
            $table->text('description')->nullable();
            $table->string('plan')->default('basic');
            $table->integer('max_users')->default(10);
            $table->integer('max_courses')->default(5);
            $table->bigInteger('max_storage_mb')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
        });
    }
};
