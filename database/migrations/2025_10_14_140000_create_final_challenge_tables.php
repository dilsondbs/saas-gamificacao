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
        // Tabela de Desafios Finais
        Schema::create('final_challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('difficulty_level', ['easy', 'medium', 'hard'])->default('medium');
            $table->integer('time_limit_minutes')->default(20);
            $table->integer('min_score_percentage')->default(70);
            $table->json('content')->nullable();
            $table->foreignId('badge_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->string('tenant_id')->nullable()->index();
            $table->timestamps();

            $table->index(['course_id', 'difficulty_level']);
        });

        // Tabela de Tentativas de Desafio
        Schema::create('challenge_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('challenge_id')->constrained('final_challenges')->onDelete('cascade');
            $table->enum('level', ['easy', 'medium', 'hard'])->default('medium');
            $table->decimal('score', 5, 2)->default(0); // Percentual (0.00 - 100.00)
            $table->json('questions')->nullable();
            $table->json('answers')->nullable();
            $table->integer('time_spent')->default(0); // Tempo em segundos
            $table->timestamp('completed_at')->nullable();
            $table->string('tenant_id')->nullable()->index();
            $table->timestamps();

            $table->index(['user_id', 'challenge_id']);
        });

        // Tabela de Motivações entre Alunos
        Schema::create('challenge_motivations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->text('message');
            $table->timestamp('confirmed_at')->nullable();
            $table->boolean('points_doubled')->default(false);
            $table->string('tenant_id')->nullable()->index();
            $table->timestamps();

            $table->index(['sender_id', 'receiver_id', 'course_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('challenge_motivations');
        Schema::dropIfExists('challenge_attempts');
        Schema::dropIfExists('final_challenges');
    }
};
