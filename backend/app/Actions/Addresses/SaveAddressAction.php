<?php

namespace App\Actions\Addresses;

use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SaveAddressAction
{
    /** @param array<string, mixed> $data */
    public function handle(Address $address, array $data): Address
    {
        return DB::transaction(function () use ($address, $data) {
            $user = User::lockForUpdate()->findOrFail($address->user_id);
            $hasDefault = $user->addresses()->whereKeyNot($address->id ?? 0)->where('is_default', true)->exists();

            $address->fill($data);
            $address->is_default = ($data['is_default'] ?? $address->is_default) || ! $hasDefault;
            $address->save();

            if ($address->is_default) {
                $user->addresses()->whereKeyNot($address->id)->update(['is_default' => false]);
            }

            return $address;
        });
    }

    public function delete(Address $address): void
    {
        DB::transaction(function () use ($address) {
            $user = User::lockForUpdate()->findOrFail($address->user_id);
            $address->delete();

            if ($address->is_default) {
                $user->addresses()->latest('id')->first()?->update(['is_default' => true]);
            }
        });
    }
}
