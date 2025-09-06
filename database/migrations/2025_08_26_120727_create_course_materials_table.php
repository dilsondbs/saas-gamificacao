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
    Schema::create('course_materials', function (Blueprint $table) {
        $table->id();
        $table->foreignId('course_id')->constrained()->onDelete('cascade');
        $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
        
        // Arquivo
        $table->string('title');
        $table->string('original_name');
        $table->string('file_path');
        $table->string('file_type'); // pdf, doc, ppt, image
        $table->integer('file_size'); // em bytes
        $table->string('mime_type');
        
        // Análise automática básica
        $table->json('file_metadata')->nullable(); // páginas, dimensões, etc
        $table->json('suggested_structure')->nullable(); // sugestões automáticas
        
        // Status
        $table->boolean('is_processed')->default(false);
        $table->boolean('is_active')->default(true);
        
        $table->timestamps();
    });
	}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('course_materials');
    }
};
