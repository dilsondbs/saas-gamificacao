<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanExpiredInvitations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invitations:clean';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean expired invitations from all tenants';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Cleaning expired invitations...');

        $expiredCount = \App\Models\UserInvitation::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);

        $this->info("Marked {$expiredCount} invitations as expired.");

        return Command::SUCCESS;
    }
}
