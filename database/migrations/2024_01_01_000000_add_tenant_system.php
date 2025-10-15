<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabelas que devem receber tenant_id (excluindo as que já têm)
        $tables = [
            'failed_jobs',
            'courses',
            'course_enrollments',
            'badges',
            'user_badges',
            'points',
            'activities',
            'user_activities',
            'sessions',
            'course_materials',
            'plan_prices',
            'user_invitations'
        ];

        // Tabelas que já possuem tenant_id (não modificar)
        // - domains (já tem tenant_id e foreign key)
        // - tenant_user_impersonation_tokens (já tem tenant_id e foreign key)
        // - tenant_contracts (já tem tenant_id)
        // - tenant_activities (já tem tenant_id)

        // Primeiro, adicionar as colunas tenant_id
        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    if (!Schema::hasColumn($table->getTable(), 'tenant_id')) {
                        $table->string('tenant_id')->nullable()->after('id');
                        $table->index('tenant_id');
                    }
                });
            }
        }

        // Depois, adicionar as foreign keys
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasTable('tenants')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
                });
            }
        }

        // Adicionar tenant_id na tabela users somente se não existir
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'tenant_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('tenant_id')->nullable()->after('id');
                $table->index('tenant_id');
            });

            // Adicionar foreign key para users separadamente
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Tabelas que devem ter tenant_id removido
        $tables = [
            'users',
            'failed_jobs',
            'courses',
            'course_enrollments',
            'badges',
            'user_badges',
            'points',
            'activities',
            'user_activities',
            'sessions',
            'course_materials',
            'plan_prices',
            'user_invitations'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropForeign(['tenant_id']);
                    $table->dropIndex(['tenant_id']);
                    $table->dropColumn('tenant_id');
                });
            }
        }
    }
};