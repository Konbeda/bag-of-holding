<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUser('Mestre da Loja', 'admin@bagofholding.test', UserRole::Admin);

        $customer = $this->seedUser('Cliente Demonstração', 'cliente@bagofholding.test', UserRole::Customer);

        $customer->addresses()->updateOrCreate(['zip_code' => '01310100'], [
            'recipient' => 'Cliente Demonstração',
            'street' => 'Avenida Paulista',
            'number' => '1000',
            'district' => 'Bela Vista',
            'city' => 'São Paulo',
            'state' => 'SP',
            'is_default' => true,
        ]);

        $this->call(CatalogSeeder::class);
    }

    private function seedUser(string $name, string $email, UserRole $role): User
    {
        $user = User::firstOrNew(['email' => $email]);
        $user->forceFill(['name' => $name, 'password' => 'password', 'role' => $role])->save();

        return $user;
    }
}
