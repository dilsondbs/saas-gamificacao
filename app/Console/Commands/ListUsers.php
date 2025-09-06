<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ListUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:list';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all users with their roles';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $users = User::all(['id', 'name', 'email', 'role', 'total_points'])->toArray();
        
        $this->info('Users in the database:');
        $this->table(['ID', 'Name', 'Email', 'Role', 'Points'], $users);
        
        $this->info('JSON Output:');
        $this->line(json_encode($users, JSON_PRETTY_PRINT));
        
        return Command::SUCCESS;
    }
}
