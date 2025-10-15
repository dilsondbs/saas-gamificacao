<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $course = $this->route('course');
        return $this->user()->can('update', $course);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $course = $this->route('course');

        return [
            'title' => [
                'required',
                'string',
                'max:255',
                'min:3',
                // Ensure unique title for the same instructor, excluding current course
                Rule::unique('courses')->where(function ($query) {
                    return $query->where('instructor_id', $this->user()->id);
                })->ignore($course->id),
            ],
            'description' => [
                'required',
                'string',
                'max:1000',
                'min:10',
            ],
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:2048', // 2MB
            ],
            'status' => [
                'required',
                'in:draft,published,archived',
                // Custom rule to validate status transitions
                function ($attribute, $value, $fail) use ($course) {
                    if (!$this->isValidStatusTransition($course->status, $value, $course)) {
                        $fail('Transição de status inválida.');
                    }
                },
            ],
            'points_per_completion' => [
                'required',
                'integer',
                'min:1',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'O título do curso é obrigatório.',
            'title.string' => 'O título deve ser um texto válido.',
            'title.max' => 'O título não pode ter mais de 255 caracteres.',
            'title.min' => 'O título deve ter pelo menos 3 caracteres.',
            'title.unique' => 'Você já possui um curso com este título.',

            'description.required' => 'A descrição do curso é obrigatória.',
            'description.string' => 'A descrição deve ser um texto válido.',
            'description.max' => 'A descrição não pode ter mais de 1000 caracteres.',
            'description.min' => 'A descrição deve ter pelo menos 10 caracteres.',

            'image.image' => 'O arquivo deve ser uma imagem válida.',
            'image.mimes' => 'A imagem deve ser do tipo: jpeg, png, jpg ou gif.',
            'image.max' => 'A imagem não pode ser maior que 2MB.',

            'status.required' => 'O status do curso é obrigatório.',
            'status.in' => 'O status deve ser: rascunho, publicado ou arquivado.',

            'points_per_completion.required' => 'Os pontos por conclusão são obrigatórios.',
            'points_per_completion.integer' => 'Os pontos devem ser um número inteiro.',
            'points_per_completion.min' => 'Os pontos devem ser pelo menos 1.',
            'points_per_completion.max' => 'Os pontos não podem ser mais de 1000.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'título',
            'description' => 'descrição',
            'image' => 'imagem',
            'status' => 'status',
            'points_per_completion' => 'pontos por conclusão',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean and prepare title
        if ($this->has('title')) {
            $this->merge([
                'title' => trim($this->title),
            ]);
        }

        // Clean and prepare description
        if ($this->has('description')) {
            $this->merge([
                'description' => trim($this->description),
            ]);
        }

        // Ensure points_per_completion is integer
        if ($this->has('points_per_completion')) {
            $this->merge([
                'points_per_completion' => (int) $this->points_per_completion,
            ]);
        }
    }

    /**
     * Validate status transitions based on business rules.
     */
    private function isValidStatusTransition(string $currentStatus, string $newStatus, $course): bool
    {
        // Same status is always valid
        if ($currentStatus === $newStatus) {
            return true;
        }

        switch ($currentStatus) {
            case 'draft':
                // Draft can go to published (if has activities) or archived
                if ($newStatus === 'published') {
                    return $course->activities()->count() > 0;
                }
                if ($newStatus === 'archived') {
                    return true;
                }
                break;

            case 'published':
                // Published can go to archived
                if ($newStatus === 'archived') {
                    return true;
                }
                // Published can go back to draft only if no active enrollments
                if ($newStatus === 'draft') {
                    return $course->enrollments()->count() === 0;
                }
                break;

            case 'archived':
                // Archived can go back to published or draft
                if (in_array($newStatus, ['published', 'draft'])) {
                    return true;
                }
                break;
        }

        return false;
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $course = $this->route('course');

        // Log validation errors for debugging
        \Illuminate\Support\Facades\Log::warning('Course update validation failed', [
            'user_id' => $this->user()->id,
            'course_id' => $course->id,
            'errors' => $validator->errors()->toArray(),
            'input' => $this->except(['image']), // Don't log file data
        ]);

        parent::failedValidation($validator);
    }
}