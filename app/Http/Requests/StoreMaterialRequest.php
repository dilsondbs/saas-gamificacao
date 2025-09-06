<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Course;

class StoreMaterialRequest extends FormRequest
{
    public function authorize()
    {
        // Verificar se o usuário é instrutor
        if ($this->user()->role !== 'instructor') {
            return false;
        }

        // Verificar se o curso pertence ao instrutor
        $course = Course::find($this->course_id);
        return $course && $course->instructor_id === $this->user()->id;
    }

    public function rules()
    {
        return [
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|min:3|max:255',
            'file' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,ppt,pptx,jpg,jpeg,png',
                'max:10240', // 10MB
            ]
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'O título é obrigatório.',
            'title.min' => 'O título deve ter pelo menos 3 caracteres.',
            'file.required' => 'Você deve selecionar um arquivo.',
            'file.mimes' => 'Apenas arquivos PDF, DOC, PPT e imagens são permitidos.',
            'file.max' => 'O arquivo deve ter no máximo 10MB.',
            'course_id.exists' => 'Curso inválido.',
        ];
    }
}