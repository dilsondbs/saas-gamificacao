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
        Schema::connection('central')->create('plan_prices', function (Blueprint $table) {
            $table->id();
            $table->string('plan_name')->unique(); // teste, basic, premium, enterprise
            $table->decimal('price', 8, 2); // preço com 2 casas decimais
            $table->timestamps();
        });

        // Inserir preços padrão
        DB::connection('central')->table('plan_prices')->insert([
            ['plan_name' => 'teste', 'price' => 0.00, 'created_at' => now(), 'updated_at' => now()],
            ['plan_name' => 'basic', 'price' => 19.90, 'created_at' => now(), 'updated_at' => now()],
            ['plan_name' => 'premium', 'price' => 49.90, 'created_at' => now(), 'updated_at' => now()],
            ['plan_name' => 'enterprise', 'price' => 199.00, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection('central')->dropIfExists('plan_prices');
    }
};
