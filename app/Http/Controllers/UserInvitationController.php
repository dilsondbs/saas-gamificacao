<?php

namespace App\Http\Controllers;

use App\Models\UserInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserInvitationController extends Controller
{
    /**
     * Display a listing of invitations
     */
    public function index()
    {
        $invitations = UserInvitation::with('inviter')
            ->where('invited_by', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Invitations/Index', [
            'invitations' => $invitations
        ]);
    }

    /**
     * Show the form for creating a new invitation
     */
    public function create()
    {
        return Inertia::render('Admin/Invitations/Create');
    }

    /**
     * Store a newly created invitation
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'unique:users,email', 'unique:user_invitations,email'],
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', Rule::in(['instructor', 'student'])],
        ]);

        $invitation = UserInvitation::createInvitation(
            $request->email,
            $request->name,
            $request->role,
            Auth::id()
        );

        // Send invitation email
        $this->sendInvitationEmail($invitation);

        return redirect()->route('invitations.index')
            ->with('success', 'Convite enviado com sucesso!');
    }

    /**
     * Cancel an invitation
     */
    public function cancel(UserInvitation $invitation)
    {
        // Check if user can cancel this invitation
        if ($invitation->invited_by !== Auth::id()) {
            abort(403, 'Não autorizado');
        }

        $invitation->cancel();

        return redirect()->route('invitations.index')
            ->with('success', 'Convite cancelado com sucesso!');
    }

    /**
     * Resend an invitation
     */
    public function resend(UserInvitation $invitation)
    {
        // Check if user can resend this invitation
        if ($invitation->invited_by !== Auth::id()) {
            abort(403, 'Não autorizado');
        }

        if ($invitation->status !== 'pending') {
            return redirect()->route('invitations.index')
                ->with('error', 'Este convite não pode ser reenviado.');
        }

        // Update expiration date
        $invitation->update([
            'expires_at' => now()->addHours(72)
        ]);

        // Resend invitation email
        $this->sendInvitationEmail($invitation);

        return redirect()->route('invitations.index')
            ->with('success', 'Convite reenviado com sucesso!');
    }

    /**
     * Show invitation acceptance form
     */
    public function show($token)
    {
        $invitation = UserInvitation::where('token', $token)->firstOrFail();

        if (!$invitation->isValid()) {
            return Inertia::render('Auth/InvitationExpired', [
                'invitation' => $invitation
            ]);
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'invitation' => $invitation
        ]);
    }

    /**
     * Accept an invitation
     */
    public function accept(Request $request, $token)
    {
        $invitation = UserInvitation::where('token', $token)->firstOrFail();

        if (!$invitation->isValid()) {
            return redirect()->route('login')
                ->with('error', 'Este convite expirou ou já foi utilizado.');
        }

        $request->validate([
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = $invitation->accept($request->password);

        if ($user) {
            Auth::login($user);

            return redirect()->route('dashboard')
                ->with('success', 'Bem-vindo! Sua conta foi criada com sucesso.');
        }

        return redirect()->route('login')
            ->with('error', 'Erro ao aceitar convite. Tente novamente.');
    }

    /**
     * Send invitation email
     */
    private function sendInvitationEmail(UserInvitation $invitation)
    {
        // Generate invitation URL
        $invitationUrl = route('invitations.show', ['token' => $invitation->token]);

        // For now, just log the invitation (you can implement actual email later)
        \Log::info('📧 Convite enviado', [
            'email' => $invitation->email,
            'name' => $invitation->name,
            'role' => $invitation->role,
            'url' => $invitationUrl,
            'expires_at' => $invitation->expires_at,
        ]);

        // TODO: Implement actual email sending
        // Mail::to($invitation->email)->send(new InvitationMail($invitation, $invitationUrl));
    }
}
