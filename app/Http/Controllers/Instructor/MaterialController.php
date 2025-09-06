<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\CourseMaterial;
use App\Models\Course;
use App\Http\Requests\StoreMaterialRequest;
use App\Services\AICourseGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MaterialController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', CourseMaterial::class);

        try {
            $materials = CourseMaterial::with(['course'])
                ->where('instructor_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            return Inertia::render('Instructor/Materials/Index', [
                'materials' => $materials
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading materials: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erro ao carregar materiais.');
        }
    }

    public function create(Course $course = null)
    {
        $this->authorize('create', [CourseMaterial::class, $course]);

        try {
            $courses = Course::where('instructor_id', Auth::id())->get();

            return Inertia::render('Instructor/Materials/Create', [
                'courses' => $courses,
                'selectedCourse' => $course
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading create material page: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erro ao carregar página.');
        }
    }

    public function store(StoreMaterialRequest $request)
    {
        Log::info('MaterialController::store - Iniciando upload', [
            'user_id' => Auth::id(),
            'course_id' => $request->course_id,
            'title' => $request->title
        ]);

        try {
            DB::beginTransaction();

            $file = $request->file('file');
            Log::info('MaterialController::store - Arquivo recebido', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ]);
            
            // Upload do arquivo
            $path = $file->store('course_materials', 'public');
            
            // Análise básica do arquivo
            $analysis = $this->analyzeFile($file);
            
            // Criar registro
            $material = CourseMaterial::create([
                'course_id' => $request->course_id,
                'instructor_id' => Auth::id(),
                'title' => $request->title,
                'original_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $this->getFileType($file),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'file_metadata' => $analysis['metadata'],
                'suggested_structure' => $analysis['suggestions'],
                'is_processed' => true,
                'is_active' => true
            ]);

            Log::info('MaterialController::store - Material criado com sucesso', [
                'material_id' => $material->id,
                'file_path' => $path
            ]);

            DB::commit();

            Log::info('MaterialController::store - Redirecionando para show', [
                'material_id' => $material->id
            ]);

            return redirect()->route('instructor.materials.show', $material)
                ->with('success', 'Material enviado com sucesso! Veja nossas sugestões.');
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Remove uploaded file if exists
            if (isset($path) && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
            
            Log::error('Error storing material: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Erro ao salvar material. Tente novamente.');
        }
    }

    public function show(CourseMaterial $material)
    {
        $this->authorize('view', $material);

        try {
            return Inertia::render('Instructor/Materials/Show', [
                'material' => $material->load('course')
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading material: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erro ao carregar material.');
        }
    }


    public function downloadFile(CourseMaterial $material)
    {
        $this->authorize('view', $material);

        try {
            $filePath = storage_path('app/public/' . $material->file_path);
            
            if (!file_exists($filePath)) {
                Log::error('File not found for download', [
                    'material_id' => $material->id,
                    'file_path' => $filePath
                ]);
                abort(404, 'Arquivo não encontrado');
            }

            Log::info('File downloaded', [
                'material_id' => $material->id,
                'user_id' => Auth::id()
            ]);

            return response()->download($filePath, $material->original_name);
        } catch (\Exception $e) {
            Log::error('Error downloading file: ' . $e->getMessage(), [
                'material_id' => $material->id
            ]);
            abort(500, 'Erro ao baixar arquivo');
        }
    }

    public function destroy(CourseMaterial $material)
    {
        $this->authorize('delete', $material);

        try {
            DB::beginTransaction();

            Log::info('MaterialController::destroy - Iniciando exclusão', [
                'material_id' => $material->id,
                'user_id' => Auth::id()
            ]);

            // Remover arquivo físico
            $filePath = $material->file_path;
            if ($filePath && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
                Log::info('Physical file deleted', ['file_path' => $filePath]);
            }

            // Remover registro do banco
            $courseId = $material->course_id;
            $material->delete();

            DB::commit();

            Log::info('Material successfully deleted', [
                'material_id' => $material->id,
                'course_id' => $courseId
            ]);

            return redirect()->route('instructor.courses.show', $courseId)
                ->with('success', 'Material excluído com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error deleting material: ' . $e->getMessage(), [
                'material_id' => $material->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                ->with('error', 'Erro ao excluir material. Tente novamente.');
        }
    }

    public function edit(CourseMaterial $material)
    {
        $this->authorize('update', $material);

        try {
            $courses = Course::where('instructor_id', Auth::id())->get();

            return Inertia::render('Instructor/Materials/Edit', [
                'material' => $material->load('course'),
                'courses' => $courses
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading edit material page: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erro ao carregar página de edição.');
        }
    }

    public function update(Request $request, CourseMaterial $material)
    {
        $this->authorize('update', $material);

        try {
            $request->validate([
                'title' => 'required|string|min:3|max:255',
                'is_active' => 'boolean'
            ]);

            $material->update([
                'title' => $request->title,
                'is_active' => $request->boolean('is_active', true)
            ]);

            Log::info('Material updated successfully', [
                'material_id' => $material->id,
                'user_id' => Auth::id()
            ]);

            return redirect()->route('instructor.materials.show', $material)
                ->with('success', 'Material atualizado com sucesso!');
        } catch (\Exception $e) {
            Log::error('Error updating material: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Erro ao atualizar material.');
        }
    }

    public function serveFile(CourseMaterial $material)
    {
        Log::info('ServeFile method called', [
            'material_id' => $material->id,
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->role ?? 'unknown',
            'material_instructor_id' => $material->instructor_id
        ]);

        try {
            // Testar autorização
            $this->authorize('view', $material);
            Log::info('Authorization passed', ['material_id' => $material->id]);
        } catch (\Exception $e) {
            Log::error('Authorization failed', [
                'material_id' => $material->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
        
        $path = storage_path('app/public/' . $material->file_path);
        
        Log::info('File path constructed', [
            'material_id' => $material->id,
            'material_file_path' => $material->file_path,
            'full_path' => $path,
            'file_exists' => file_exists($path)
        ]);
        
        if (!file_exists($path)) {
            Log::error('File not found', [
                'material_id' => $material->id,
                'path' => $path
            ]);
            abort(404, 'Arquivo não encontrado');
        }
        
        Log::info('Serving file successfully', [
            'material_id' => $material->id,
            'user_id' => Auth::id(),
            'file_path' => $material->file_path,
            'mime_type' => $material->mime_type,
            'original_name' => $material->original_name
        ]);
        
        return response()->file($path, [
            'Content-Type' => $material->mime_type,
            'Content-Disposition' => 'inline; filename="' . $material->original_name . '"'
        ]);
    }

    public function generateCourseFromMaterial(Request $request, Course $course)
    {
        $this->authorize('update', $course); // Instrutor deve poder editar o curso
        
        try {
            $materialId = $request->input('material_id');
            $material = CourseMaterial::where('course_id', $course->id)
                                    ->where('id', $materialId)
                                    ->where('instructor_id', Auth::id())
                                    ->firstOrFail();

            Log::info('Starting AI course generation', [
                'course_id' => $course->id,
                'material_id' => $material->id,
                'user_id' => Auth::id()
            ]);

            $aiService = new AICourseGeneratorService();
            $result = $aiService->generateCourseFromMaterial($material, $course);

            if ($result['success']) {
                return redirect()->route('instructor.courses.show', $course)
                    ->with('success', 'Curso gerado automaticamente pela IA! ' . 
                          count($result['activities']) . ' atividades e ' . 
                          count($result['badges']) . ' badges criados.');
            } else {
                return redirect()->back()
                    ->with('error', 'Erro na geração automática: ' . $result['error']);
            }

        } catch (\Exception $e) {
            Log::error('Error in AI course generation', [
                'error' => $e->getMessage(),
                'course_id' => $course->id
            ]);

            return redirect()->back()
                ->with('error', 'Erro ao gerar curso automaticamente. Tente novamente.');
        }
    }

    private function analyzeFile($file)
    {
        $fileType = $this->getFileType($file);
        $fileSize = $file->getSize();
        
        // Metadata básica
        $metadata = [
            'original_name' => $file->getClientOriginalName(),
            'size_formatted' => $this->formatFileSize($fileSize),
            'type' => $fileType
        ];
        
        // Sugestões baseadas no tipo de arquivo
        $suggestions = $this->generateSuggestions($fileType, $fileSize);
        
        return [
            'metadata' => $metadata,
            'suggestions' => $suggestions
        ];
    }
    
    private function getFileType($file)
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        $types = [
            'pdf' => 'pdf',
            'doc' => 'document', 
            'docx' => 'document',
            'ppt' => 'presentation',
            'pptx' => 'presentation',
            'jpg' => 'image',
            'jpeg' => 'image', 
            'png' => 'image'
        ];
        
        return $types[$extension] ?? 'other';
    }
    
    private function formatFileSize($bytes)
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }
    
    private function generateSuggestions($fileType, $fileSize)
    {
        $suggestions = [];
        
        switch($fileType) {
            case 'pdf':
                $suggestions = [
                    'structure' => 'Divida em 3-5 módulos baseado no conteúdo',
                    'activities' => 'Crie um quiz a cada 2 módulos',
                    'completion' => 'Adicione uma atividade prática final',
                    'engagement' => 'Considere vídeos explicativos complementares'
                ];
                break;
                
            case 'presentation':
                $suggestions = [
                    'structure' => 'Cada slide pode ser uma lição',
                    'activities' => 'Quiz baseado nos slides principais', 
                    'completion' => 'Projeto baseado na apresentação',
                    'engagement' => 'Grave narração dos slides'
                ];
                break;
                
            case 'document':
                $suggestions = [
                    'structure' => 'Divida por capítulos ou seções',
                    'activities' => 'Exercícios baseados no texto',
                    'completion' => 'Resumo ou ensaio final',
                    'engagement' => 'Destaque pontos-chave interativos'
                ];
                break;
                
            default:
                $suggestions = [
                    'structure' => 'Organize o conteúdo em módulos lógicos',
                    'activities' => 'Crie atividades relevantes ao material',
                    'completion' => 'Defina critérios de conclusão',
                    'engagement' => 'Adicione elementos interativos'
                ];
        }
        
        return $suggestions;
    }
}