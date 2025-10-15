<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UploadMaterialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if user can update the course
        $course = $this->route('course');
        return $this->user()->can('update', $course);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'material' => [
                'required',
                File::types(['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx'])
                    ->max(10 * 1024) // 10MB in KB
                    ->min(1), // At least 1KB
            ],
            'title' => [
                'required',
                'string',
                'max:255',
                'min:3',
            ],
            'description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'auto_generate' => [
                'boolean',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'material.required' => 'É necessário selecionar um arquivo.',
            'material.file' => 'O arquivo enviado não é válido.',
            'material.mimes' => 'O arquivo deve ser do tipo: PDF, DOC, DOCX, TXT, PPT ou PPTX.',
            'material.max' => 'O arquivo não pode ser maior que 10MB.',
            'material.min' => 'O arquivo não pode estar vazio.',

            'title.required' => 'O título do material é obrigatório.',
            'title.string' => 'O título deve ser um texto válido.',
            'title.max' => 'O título não pode ter mais de 255 caracteres.',
            'title.min' => 'O título deve ter pelo menos 3 caracteres.',

            'description.string' => 'A descrição deve ser um texto válido.',
            'description.max' => 'A descrição não pode ter mais de 500 caracteres.',

            'auto_generate.boolean' => 'O campo de geração automática deve ser verdadeiro ou falso.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'material' => 'arquivo',
            'title' => 'título',
            'description' => 'descrição',
            'auto_generate' => 'geração automática',
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

        // Ensure auto_generate is boolean
        if ($this->has('auto_generate')) {
            $this->merge([
                'auto_generate' => filter_var($this->auto_generate, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Additional file validation
            if ($this->hasFile('material')) {
                $file = $this->file('material');

                // Check if file is corrupted
                if (!$this->isValidFile($file)) {
                    $validator->errors()->add('material', 'O arquivo parece estar corrompido ou não pode ser lido.');
                }

                // Check for malicious content (basic security)
                if ($this->hasExecutableContent($file)) {
                    $validator->errors()->add('material', 'O arquivo contém conteúdo não permitido.');
                }
            }

            // Check course capacity (if applicable)
            $course = $this->route('course');
            if ($course && $course->materials()->count() >= 50) {
                $validator->errors()->add('material', 'Este curso já atingiu o limite máximo de 50 materiais.');
            }
        });
    }

    /**
     * Check if file is valid and readable
     */
    protected function isValidFile($file): bool
    {
        try {
            // Basic file validation
            if (!$file->isValid()) {
                return false;
            }

            // Check if file size matches reported size
            $realSize = filesize($file->getPathname());
            $reportedSize = $file->getSize();

            if (abs($realSize - $reportedSize) > 1024) { // Allow 1KB difference
                return false;
            }

            // Check file header for common file types
            $fileHeader = file_get_contents($file->getPathname(), false, null, 0, 10);

            if (!$fileHeader) {
                return false;
            }

            return $this->validateFileHeader($fileHeader, $file->getClientOriginalExtension());

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('File validation error', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Validate file header based on extension
     */
    private function validateFileHeader(string $header, string $extension): bool
    {
        $signatures = [
            'pdf' => ['%PDF'],
            'doc' => ["\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"], // MS Office
            'docx' => ['PK'], // ZIP-based format
            'ppt' => ["\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"], // MS Office
            'pptx' => ['PK'], // ZIP-based format
            'txt' => [], // No specific signature for text files
        ];

        $ext = strtolower($extension);

        // No signature validation for text files
        if ($ext === 'txt') {
            return true;
        }

        if (!isset($signatures[$ext])) {
            return false;
        }

        foreach ($signatures[$ext] as $signature) {
            if (strpos($header, $signature) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check for executable content (basic security check)
     */
    private function hasExecutableContent($file): bool
    {
        try {
            $fileName = strtolower($file->getClientOriginalName());

            // Check for dangerous extensions
            $dangerousExtensions = [
                '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar', '.app'
            ];

            foreach ($dangerousExtensions as $ext) {
                if (str_ends_with($fileName, $ext)) {
                    return true;
                }
            }

            // Check file content for executable signatures
            $content = file_get_contents($file->getPathname(), false, null, 0, 512);

            // Windows executable signatures
            if (strpos($content, 'MZ') === 0 || strpos($content, "\x7fELF") === 0) {
                return true;
            }

            return false;

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Executable content check error', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);
            return true; // Err on the side of caution
        }
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $course = $this->route('course');

        // Log validation errors for debugging
        \Illuminate\Support\Facades\Log::warning('Material upload validation failed', [
            'user_id' => $this->user()->id,
            'course_id' => $course ? $course->id : null,
            'errors' => $validator->errors()->toArray(),
            'file_info' => $this->hasFile('material') ? [
                'name' => $this->file('material')->getClientOriginalName(),
                'size' => $this->file('material')->getSize(),
                'mime' => $this->file('material')->getMimeType(),
            ] : null,
        ]);

        parent::failedValidation($validator);
    }
}