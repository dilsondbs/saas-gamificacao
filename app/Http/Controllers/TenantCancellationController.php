<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\TenantActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class TenantCancellationController extends Controller
{
    /**
     * Mostrar formulário de cancelamento
     */
    public function showCancellationForm(Request $request)
    {
        $tenant = tenancy()->tenant;
        
        if (!$tenant) {
            return redirect()->route('login')->with('error', 'Acesso não autorizado.');
        }

        // Verificar se já está pendente de exclusão
        if ($tenant->isPendingDeletion()) {
            return Inertia::render('Tenant/CancellationStatus', [
                'tenant' => $tenant,
                'daysUntilDeletion' => $tenant->getDaysUntilDeletion(),
                'canRestore' => $tenant->canBeRestored()
            ]);
        }

        return Inertia::render('Tenant/CancelSubscription', [
            'tenant' => $tenant,
            'cancellationReasons' => [
                'cost_too_high' => 'Custo muito alto',
                'not_using_enough' => 'Não estou usando o suficiente',
                'missing_features' => 'Faltam funcionalidades que preciso',
                'technical_issues' => 'Problemas técnicos',
                'switching_competitor' => 'Mudando para um concorrente',
                'business_closed' => 'Negócio encerrado',
                'temporary_pause' => 'Pausa temporária',
                'other' => 'Outro motivo'
            ]
        ]);
    }

    /**
     * Processar cancelamento
     */
    public function processCancellation(Request $request)
    {
        $tenant = tenancy()->tenant;
        
        if (!$tenant || $tenant->isPendingDeletion()) {
            return redirect()->back()->with('error', 'Cancelamento não disponível.');
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string',
            'feedback' => 'nullable|string|max:1000',
            'confirm_cancellation' => 'required|accepted',
            'understand_consequences' => 'required|accepted'
        ], [
            'reason.required' => 'Selecione um motivo para o cancelamento',
            'confirm_cancellation.accepted' => 'Você deve confirmar o cancelamento',
            'understand_consequences.accepted' => 'Você deve confirmar que entende as consequências'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Formatar motivo para exibição
        $reasonText = $this->getCancellationReasonText($request->reason);
        $fullReason = $reasonText . ($request->feedback ? " - {$request->feedback}" : '');

        // Agendar para exclusão
        $tenant->scheduleForDeletion($fullReason, 30);

        // Cancelar billing se existir
        $this->cancelBilling($tenant);

        // Enviar email de confirmação (implementar depois)
        // $this->sendCancellationEmail($tenant);

        return Inertia::render('Tenant/CancellationConfirmation', [
            'tenant' => $tenant,
            'cancellationReason' => $reasonText,
            'deletionDate' => $tenant->deletion_scheduled_at,
            'daysUntilDeletion' => $tenant->getDaysUntilDeletion()
        ]);
    }

    /**
     * Restaurar tenant do cancelamento
     */
    public function restoreTenant(Request $request)
    {
        $tenant = tenancy()->tenant;
        
        if (!$tenant || !$tenant->canBeRestored()) {
            return redirect()->back()->with('error', 'Restauração não disponível.');
        }

        $restored = $tenant->restoreFromPendingDeletion();

        if ($restored) {
            return redirect()->route('dashboard')->with('success', 'Sua conta foi restaurada com sucesso!');
        }

        return redirect()->back()->with('error', 'Falha ao restaurar a conta.');
    }

    /**
     * Obter texto do motivo de cancelamento
     */
    private function getCancellationReasonText($reason)
    {
        $reasons = [
            'cost_too_high' => 'Custo muito alto',
            'not_using_enough' => 'Não estou usando o suficiente',
            'missing_features' => 'Faltam funcionalidades que preciso',
            'technical_issues' => 'Problemas técnicos',
            'switching_competitor' => 'Mudando para um concorrente',
            'business_closed' => 'Negócio encerrado',
            'temporary_pause' => 'Pausa temporária',
            'other' => 'Outro motivo'
        ];

        return $reasons[$reason] ?? 'Motivo não especificado';
    }

    /**
     * Cancelar billing
     */
    private function cancelBilling($tenant)
    {
        try {
            $contracts = \App\Models\TenantContract::where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->get();

            foreach ($contracts as $contract) {
                $contract->status = 'cancelled';
                $contract->save();
            }

            // Log da atividade
            TenantActivity::create([
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'activity_type' => 'billing_cancelled',
                'plan_name' => $tenant->plan,
                'monthly_value' => 0,
                'financial_impact' => 0,
                'description' => "Faturamento cancelado para o tenant {$tenant->name}",
                'occurred_at' => now(),
                'performed_by' => auth()->user()?->name ?? 'System',
                'metadata' => json_encode([
                    'contracts_cancelled' => $contracts->count()
                ])
            ]);
        } catch (\Exception $e) {
            \Log::error('Erro ao cancelar billing: ' . $e->getMessage());
        }
    }

    /**
     * Enviar email de cancelamento (para implementar)
     */
    private function sendCancellationEmail($tenant)
    {
        try {
            // TODO: Implementar envio de email
            // Mail::to($tenant->admin_email)->send(new CancellationConfirmationEmail($tenant));
        } catch (\Exception $e) {
            \Log::error('Erro ao enviar email de cancelamento: ' . $e->getMessage());
        }
    }
}
