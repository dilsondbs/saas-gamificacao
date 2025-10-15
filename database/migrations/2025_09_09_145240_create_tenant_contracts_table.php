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
        Schema::connection('central')->create('tenant_contracts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id'); // ID do tenant
            $table->string('plan_name'); // basic, premium, enterprise
            $table->decimal('contracted_price', 8, 2); // Preço contratual fixo
            $table->date('contract_start'); // Início do contrato
            $table->date('contract_end'); // Fim do contrato (renovação)
            $table->enum('status', ['active', 'cancelled', 'suspended', 'pending'])->default('active');
            $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly');
            $table->decimal('discount_percentage', 5, 2)->default(0); // Desconto especial
            $table->text('notes')->nullable(); // Observações do contrato
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['contract_end']);
        });

        // Criar contratos para tenants existentes
        $tenants = DB::connection('central')->table('tenants')->get();
        foreach ($tenants as $tenant) {
            $planPrices = [
                'basic' => 19.90,
                'premium' => 49.90,
                'enterprise' => 199.00
            ];
            
            DB::connection('central')->table('tenant_contracts')->insert([
                'tenant_id' => $tenant->id,
                'plan_name' => $tenant->plan ?? 'basic',
                'contracted_price' => $planPrices[$tenant->plan ?? 'basic'],
                'contract_start' => now()->subMonths(rand(1, 12)), // Contratos simulados
                'contract_end' => now()->addYear(),
                'status' => 'active',
                'billing_cycle' => 'monthly',
                'discount_percentage' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection('central')->dropIfExists('tenant_contracts');
    }
};