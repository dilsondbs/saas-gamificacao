<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Traits\BelongsToTenant;

class UserInvitation extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'user_invitations';

    protected $fillable = [
        'email',
        'name',
        'role',
        'token',
        'invited_by',
        'expires_at',
        'accepted_at',
        'user_id',
        'status',
        'invitation_data',
        'tenant_id',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
        'invitation_data' => 'array',
    ];

    /**
     * Relationship with the user who sent the invitation
     */
    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /**
     * Relationship with the user who accepted the invitation
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Generate a new invitation
     */
    public static function createInvitation($email, $name, $role, $inviterId, $expirationHours = 72)
    {
        return self::create([
            'email' => $email,
            'name' => $name,
            'role' => $role,
            'token' => Str::random(32),
            'invited_by' => $inviterId,
            'expires_at' => Carbon::now()->addHours($expirationHours),
            'status' => 'pending',
        ]);
    }

    /**
     * Check if invitation is valid
     */
    public function isValid()
    {
        return $this->status === 'pending' && $this->expires_at->isFuture();
    }

    /**
     * Accept the invitation and create user
     */
    public function accept($password)
    {
        if (!$this->isValid()) {
            return false;
        }

        // Create the user
        $user = User::create([
            'name' => $this->name,
            'email' => $this->email,
            'password' => bcrypt($password),
            'role' => $this->role,
            'email_verified_at' => now(),
            'password_is_temporary' => false, // User set their own password
            'total_points' => 0,
        ]);

        // Mark invitation as accepted
        $this->update([
            'status' => 'accepted',
            'accepted_at' => now(),
            'user_id' => $user->id,
        ]);

        return $user;
    }

    /**
     * Mark invitation as expired
     */
    public function markAsExpired()
    {
        $this->update(['status' => 'expired']);
    }

    /**
     * Cancel invitation
     */
    public function cancel()
    {
        $this->update(['status' => 'cancelled']);
    }

    /**
     * Scope for pending invitations
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for valid invitations (pending and not expired)
     */
    public function scopeValid($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '>', now());
    }
}
