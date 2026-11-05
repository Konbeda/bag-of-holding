<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable(['path', 'alt', 'position'])]
class ProductImage extends Model
{
    public function url(): string
    {
        return Str::startsWith($this->path, ['http://', 'https://']) ? $this->path : asset($this->path);
    }
}
