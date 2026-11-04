<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['recipient', 'zip_code', 'street', 'number', 'complement', 'district', 'city', 'state', 'is_default'])]
class Address extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['is_default' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array<string, string|null> */
    public function toSnapshot(): array
    {
        return $this->only(['recipient', 'zip_code', 'street', 'number', 'complement', 'district', 'city', 'state']);
    }
}
