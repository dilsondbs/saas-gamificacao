<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
            $table->timestamp('deletion_scheduled_at')->nullable()->after('deleted_at');
            $table->string('cancellation_reason')->nullable()->after('deletion_scheduled_at');
            $table->string('status')->default('active')->after('cancellation_reason'); // active, pending_deletion, cancelled
            $table->json('deletion_metadata')->nullable()->after('status'); // backup info, billing data, etc.
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'deleted_at',
                'deletion_scheduled_at', 
                'cancellation_reason',
                'status',
                'deletion_metadata'
            ]);
        });
    }
};
