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
        Schema::table('badges', function (Blueprint $table) {
            // Adicionar coluna rarity
            $table->enum('rarity', ['common', 'rare', 'epic', 'legendary'])->default('common')->after('criteria');

            // Adicionar coluna tenant_id (se não existir)
            if (!Schema::hasColumn('badges', 'tenant_id')) {
                $table->uuid('tenant_id')->nullable()->after('rarity');
                $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->dropColumn('rarity');

            if (Schema::hasColumn('badges', 'tenant_id')) {
                $table->dropForeign(['tenant_id']);
                $table->dropColumn('tenant_id');
            }
        });
    }
};
