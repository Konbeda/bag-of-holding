<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product)],
            'description' => ['required', 'string'],
            'price_cents' => ['required', 'integer', 'min:1'],
            'compare_at_price_cents' => ['nullable', 'integer', 'gt:price_cents'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'specifications' => ['nullable', 'array'],
            'specifications.*' => ['string', 'max:255'],
            'images' => ['sometimes', 'array', 'max:8'],
            'images.*.path' => ['required', 'string', 'max:255'],
            'images.*.alt' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['slug' => Str::slug((string) ($this->input('slug') ?: $this->input('name')))]);
    }
}
