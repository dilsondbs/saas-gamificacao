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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('password_is_temporary')->default(false)->after('password');
            $table->timestamp('password_changed_at')->nullable()->after('password_is_temporary');
            $table->timestamp('last_login_at')->nullable()->after('password_changed_at');
            $table->string('temporary_token')->nullable()->after('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['password_is_temporary', 'password_changed_at', 'last_login_at', 'temporary_token']);
        });
    }
};
