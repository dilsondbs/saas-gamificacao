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
        Schema::connection('central')->create('tenant_activities', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('tenant_name');
            $table->string('activity_type'); // created, deleted, suspended, reactivated, upgraded, downgraded
            $table->string('plan_name');
            $table->decimal('monthly_value', 10, 2)->default(0); // Valor mensal no momento da ação
            $table->decimal('financial_impact', 10, 2); // Impacto financeiro positivo/negativo
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Dados adicionais como motivo da exclusão, etc.
            $table->timestamp('occurred_at');
            $table->string('performed_by')->nullable(); // Usuário que fez a ação
            $table->timestamps();
            
            $table->index(['tenant_id', 'activity_type']);
            $table->index(['activity_type', 'occurred_at']);
            $table->index('occurred_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection('central')->dropIfExists('tenant_activities');
    }
};
