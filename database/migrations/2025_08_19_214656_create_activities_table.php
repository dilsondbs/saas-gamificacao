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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['lesson', 'quiz', 'assignment', 'video', 'reading'])->default('lesson');
            $table->integer('points_value')->default(10);
            $table->integer('order')->default(0);
            $table->json('content')->nullable();
            $table->boolean('is_required')->default(true);
            $table->timestamps();
            
            $table->index(['course_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('activities');
    }
};
