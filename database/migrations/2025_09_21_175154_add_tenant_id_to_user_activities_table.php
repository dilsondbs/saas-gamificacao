<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_activities', function (Blueprint $table) {
            $table->string('tenant_id', 36)->after('id')->nullable();
            $table->index('tenant_id');
        });

        // Update existing records with tenant_id from users table
        DB::statement('
            UPDATE user_activities ua
            SET tenant_id = (
                SELECT tenant_id FROM users u WHERE u.id = ua.user_id
            )
            WHERE ua.tenant_id IS NULL
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_activities', function (Blueprint $table) {
            $table->dropIndex(['tenant_id']);
            $table->dropColumn('tenant_id');
        });
    }
};
