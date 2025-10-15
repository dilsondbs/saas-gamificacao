<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProgressCheckRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'activity_id' => [
                'required',
                'integer',
                'exists:activities,id'
            ],
            'score' => [
                'required',
                'integer',
                'min:0',
                'max:100'
            ],
            'time_spent' => [
                'nullable',
                'integer',
                'min:0',
                'max:7200' // Max 2 hours in seconds
            ],
            'metadata' => [
                'nullable',
                'array'
            ],
            'metadata.answers' => [
                'nullable',
                'array'
            ],
            'metadata.difficulty_rating' => [
                'nullable',
                'integer',
                'min:1',
                'max:5'
            ],
            'metadata.feedback' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'attempt_type' => [
                'nullable',
                'string',
                Rule::in(['first_attempt', 'retry', 'review'])
            ]
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'activity_id.required' => 'ID da atividade é obrigatório.',
            'activity_id.exists' => 'Atividade não encontrada.',
            'score.required' => 'Pontuação é obrigatória.',
            'score.integer' => 'Pontuação deve ser um número inteiro.',
            'score.min' => 'Pontuação mínima é 0.',
            'score.max' => 'Pontuação máxima é 100.',
            'time_spent.integer' => 'Tempo gasto deve ser um número inteiro.',
            'time_spent.min' => 'Tempo gasto não pode ser negativo.',
            'time_spent.max' => 'Tempo máximo permitido é de 2 horas.',
            'metadata.array' => 'Metadados devem ser um array.',
            'metadata.answers.array' => 'Respostas devem ser um array.',
            'metadata.difficulty_rating.integer' => 'Avaliação de dificuldade deve ser um número.',
            'metadata.difficulty_rating.min' => 'Avaliação mínima é 1.',
            'metadata.difficulty_rating.max' => 'Avaliação máxima é 5.',
            'metadata.feedback.string' => 'Feedback deve ser texto.',
            'metadata.feedback.max' => 'Feedback não pode exceder 1000 caracteres.',
            'attempt_type.in' => 'Tipo de tentativa inválido.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes()
    {
        return [
            'activity_id' => 'atividade',
            'score' => 'pontuação',
            'time_spent' => 'tempo gasto',
            'metadata' => 'metadados',
            'metadata.answers' => 'respostas',
            'metadata.difficulty_rating' => 'avaliação de dificuldade',
            'metadata.feedback' => 'feedback',
            'attempt_type' => 'tipo de tentativa'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Ensure score is an integer
        if ($this->has('score')) {
            $this->merge([
                'score' => (int) $this->score
            ]);
        }

        // Ensure time_spent is an integer if provided
        if ($this->has('time_spent') && $this->time_spent !== null) {
            $this->merge([
                'time_spent' => (int) $this->time_spent
            ]);
        }

        // Set default attempt type if not provided
        if (!$this->has('attempt_type')) {
            $this->merge([
                'attempt_type' => 'first_attempt'
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate that user is enrolled in the activity's course
            if ($this->has('activity_id')) {
                $activity = \App\Models\Activity::find($this->activity_id);

                if ($activity) {
                    $enrollment = \App\Models\CourseEnrollment::where('user_id', auth()->id())
                        ->where('course_id', $activity->course_id)
                        ->first();

                    if (!$enrollment) {
                        $validator->errors()->add(
                            'activity_id',
                            'Você não está matriculado no curso desta atividade.'
                        );
                    }
                }
            }

            // Validate score based on minimum progression requirement
            if ($this->has('score') && $this->score < 70) {
                $validator->after(function ($validator) {
                    $validator->errors()->add(
                        'score',
                        'Pontuação mínima para progressão é 70%. Você pode tentar novamente.'
                    );
                });
            }
        });
    }
}