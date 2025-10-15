<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'description',
        'plan',
        'max_users',
        'max_courses',
        'max_storage_mb',
        'is_active',
        'trial_ends_at',
        'subscription_ends_at',
        'status',
        'cancellation_reason',
        'deletion_scheduled_at',
        'deletion_metadata',
        'data'
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'is_active' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'deletion_scheduled_at' => 'datetime',
        'max_users' => 'integer',
        'max_courses' => 'integer',
        'max_storage_mb' => 'integer',
        'data' => 'array',
        'deletion_metadata' => 'array',
    ];

    public function isTrialActive()
    {
        return $this->trial_ends_at && now()->isBefore($this->trial_ends_at);
    }

    /**
     * Relationship with domains - Using local domains table
     */
    public function domains()
    {
        return $this->hasMany(\App\Models\Domain::class, 'tenant_id', 'id');
    }

    public function isSubscriptionActive()
    {
        return $this->subscription_ends_at && now()->isBefore($this->subscription_ends_at);
    }

    public function canCreateUsers($count = 1)
    {
        if (!$this->is_active) return false;

        // No banco único, contar usuários deste tenant
        $currentUsers = \App\Models\User::where('tenant_id', $this->id)->count();
        return ($currentUsers + $count) <= $this->max_users;
    }

    public function canCreateCourses($count = 1)
    {
        if (!$this->is_active) return false;

        $currentCourses = \App\Models\Course::where('tenant_id', $this->id)->count();
        return ($currentCourses + $count) <= $this->max_courses;
    }

    public function getStorageUsedMb()
    {
        $storageUsed = \App\Models\CourseMaterial::where('tenant_id', $this->id)->sum('file_size') ?? 0;
        return round($storageUsed / 1024 / 1024, 2);
    }

    // MÉTODOS PARA SISTEMA DE CANCELAMENTO

    public function isPendingDeletion()
    {
        return $this->status === 'pending_deletion';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    public function isActiveStatus()
    {
        return $this->status === 'active' && !$this->deleted_at;
    }

    public function scheduleForDeletion($reason = null, $days = 30)
    {
        // SEGURANÇA: Verificar se já está agendado para exclusão
        if ($this->isPendingDeletion()) {
            throw new \Exception("Tenant já está agendado para exclusão. Use restoreFromPendingDeletion() primeiro se necessário.");
        }

        // SEGURANÇA: Verificar se tenant já foi soft deleted
        if ($this->deleted_at) {
            throw new \Exception("Tenant já foi excluído. Use forceDelete() se necessário purgar permanentemente.");
        }

        $this->status = 'pending_deletion';
        $this->deletion_scheduled_at = now()->addDays($days);
        $this->cancellation_reason = $reason;
        $this->is_active = false; // Desativar imediatamente
        $this->save();

        // Log da atividade
        \App\Models\TenantActivity::create([
            'tenant_id' => $this->id,
            'tenant_name' => $this->name,
            'activity_type' => 'scheduled_deletion',
            'plan_name' => $this->plan,
            'monthly_value' => 0,
            'financial_impact' => 0,
            'description' => "Tenant {$this->name} foi agendado para exclusão. Motivo: " . ($reason ?? 'Não informado'),
            'occurred_at' => now(),
            'performed_by' => auth()->user()?->name ?? 'System',
            'metadata' => json_encode([
                'deletion_scheduled_at' => $this->deletion_scheduled_at,
                'reason' => $reason,
                'grace_period_days' => $days
            ])
        ]);

        return $this;
    }

    public function restoreFromPendingDeletion()
    {
        if ($this->isPendingDeletion()) {
            $this->status = 'active';
            $this->deletion_scheduled_at = null;
            $this->cancellation_reason = null;
            $this->is_active = true;
            $this->save();

            // Log da restauração
            \App\Models\TenantActivity::create([
                'tenant_id' => $this->id,
                'tenant_name' => $this->name,
                'activity_type' => 'restored',
                'plan_name' => $this->plan,
                'monthly_value' => 0,
                'financial_impact' => 0,
                'description' => "Tenant {$this->name} foi restaurado do agendamento de exclusão",
                'occurred_at' => now(),
                'performed_by' => auth()->user()?->name ?? 'System',
                'metadata' => json_encode([
                    'restored_at' => now()
                ])
            ]);

            return true;
        }
        return false;
    }

    public function getDaysUntilDeletion()
    {
        if (!$this->deletion_scheduled_at) {
            return null;
        }

        return now()->diffInDays($this->deletion_scheduled_at, false);
    }

    public function canBeRestored()
    {
        return $this->isPendingDeletion() && 
               $this->deletion_scheduled_at && 
               now()->isBefore($this->deletion_scheduled_at);
    }

    public function isOverdueForDeletion()
    {
        return $this->isPendingDeletion() && 
               $this->deletion_scheduled_at && 
               now()->isAfter($this->deletion_scheduled_at);
    }

    // Scope para tenants ativos (não deletados e não pendentes)
    public function scopeActive($query)
    {
        return $query->where('status', 'active')->whereNull('deleted_at');
    }

    // Scope para tenants pendentes de exclusão
    public function scopePendingDeletion($query)
    {
        return $query->where('status', 'pending_deletion')->whereNull('deleted_at');
    }

    // Scope para tenants vencidos (devem ser excluídos)
    public function scopeOverdueForDeletion($query)
    {
        return $query->where('status', 'pending_deletion')
                    ->whereNotNull('deletion_scheduled_at')
                    ->where('deletion_scheduled_at', '<', now())
                    ->whereNull('deleted_at');
    }

    // MÉTODOS DE LIMPEZA AUTOMÁTICA

    public function cleanupTenantData()
    {
        try {
            $cleanupResults = [
                'files_deleted' => 0,
                'cache_cleared' => false,
                'backup_created' => false,
                'errors' => []
            ];

            // Criar backup antes da limpeza
            $cleanupResults['backup_created'] = $this->createDeletionBackup();

            // Limpar arquivos do storage
            $cleanupResults['files_deleted'] = $this->cleanupTenantFiles();

            // Limpar cache específico do tenant
            $cleanupResults['cache_cleared'] = $this->clearTenantCache();

            // Log da limpeza
            \App\Models\TenantActivity::create([
                'tenant_id' => $this->id,
                'tenant_name' => $this->name,
                'activity_type' => 'data_cleanup',
                'plan_name' => $this->plan,
                'monthly_value' => 0,
                'financial_impact' => 0,
                'description' => "Limpeza automática de dados do tenant {$this->name}",
                'occurred_at' => now(),
                'performed_by' => 'System',
                'metadata' => json_encode($cleanupResults)
            ]);

            return $cleanupResults;

        } catch (\Exception $e) {
            \Log::error("Erro na limpeza do tenant {$this->id}: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function createDeletionBackup()
    {
        try {
            $backupPath = storage_path("app/tenant-backups/{$this->id}");
            
            if (!is_dir($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            $backupData = [
                'tenant_info' => $this->toArray(),
                'deletion_date' => now()->toDateTimeString(),
                'backup_created_at' => now()->toDateTimeString(),
                'plan' => $this->plan,
                'cancellation_reason' => $this->cancellation_reason
            ];

            try {
                // Backup de dados essenciais no banco único
                $backupData['users_count'] = \App\Models\User::where('tenant_id', $this->id)->count();
                $backupData['courses_count'] = \App\Models\Course::where('tenant_id', $this->id)->count() ?? 0;

                // Salvar informações de contrato se existir
                $contracts = \App\Models\TenantContract::where('tenant_id', $this->id)->get();
                $backupData['contracts'] = $contracts->toArray();

            } catch (\Exception $e) {
                $backupData['tenant_data_error'] = $e->getMessage();
            }

            // Salvar backup em JSON
            $backupFile = $backupPath . '/backup_' . now()->format('Y-m-d_H-i-s') . '.json';
            file_put_contents($backupFile, json_encode($backupData, JSON_PRETTY_PRINT));

            // Atualizar metadata de exclusão
            $this->deletion_metadata = array_merge($this->deletion_metadata ?? [], [
                'backup_created' => true,
                'backup_path' => $backupFile,
                'backup_date' => now()->toDateTimeString()
            ]);
            $this->save();

            return true;

        } catch (\Exception $e) {
            \Log::error("Erro ao criar backup do tenant {$this->id}: " . $e->getMessage());
            return false;
        }
    }

    public function cleanupTenantFiles()
    {
        $filesDeleted = 0;

        try {
            // Limpar materiais de curso
            $materialPath = storage_path("app/public/course_materials/{$this->id}");
            if (is_dir($materialPath)) {
                $files = glob($materialPath . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                        $filesDeleted++;
                    }
                }
                rmdir($materialPath);
            }

            // Limpar uploads temporários
            $tempPath = storage_path("app/temp/{$this->id}");
            if (is_dir($tempPath)) {
                $files = glob($tempPath . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                        $filesDeleted++;
                    }
                }
                rmdir($tempPath);
            }

            // Limpar cache de arquivos
            $cachePath = storage_path("app/cache/tenants/{$this->id}");
            if (is_dir($cachePath)) {
                $files = glob($cachePath . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                        $filesDeleted++;
                    }
                }
                rmdir($cachePath);
            }

        } catch (\Exception $e) {
            \Log::error("Erro ao limpar arquivos do tenant {$this->id}: " . $e->getMessage());
        }

        return $filesDeleted;
    }

    public function clearTenantCache()
    {
        try {
            // Limpar cache com tags do tenant
            \Cache::tags("tenant.{$this->id}")->flush();
            
            // Limpar cache de configurações do tenant
            \Cache::forget("tenant.{$this->id}.config");
            \Cache::forget("tenant.{$this->id}.limits");
            \Cache::forget("tenant.{$this->id}.users");

            return true;

        } catch (\Exception $e) {
            \Log::error("Erro ao limpar cache do tenant {$this->id}: " . $e->getMessage());
            return false;
        }
    }

    public function executeFinalDeletion()
    {
        try {
            // Log da exclusão final
            \App\Models\TenantActivity::create([
                'tenant_id' => $this->id,
                'tenant_name' => $this->name,
                'activity_type' => 'final_deletion',
                'plan_name' => $this->plan,
                'monthly_value' => 0,
                'financial_impact' => 0,
                'description' => "Exclusão final do tenant {$this->name}",
                'occurred_at' => now(),
                'performed_by' => 'System',
                'metadata' => json_encode([
                    'deletion_scheduled_at' => $this->deletion_scheduled_at,
                    'cancellation_reason' => $this->cancellation_reason,
                    'grace_period_expired' => true
                ])
            ]);

            // Executar limpeza completa
            $cleanupResults = $this->cleanupTenantData();

            // Soft delete do tenant
            $this->delete();

            return [
                'success' => true,
                'cleanup_results' => $cleanupResults,
                'deleted_at' => now()
            ];

        } catch (\Exception $e) {
            \Log::error("Erro na exclusão final do tenant {$this->id}: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}