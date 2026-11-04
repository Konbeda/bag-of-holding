<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShippingQuoteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'zip_code' => ['required', 'digits:8'],
            'subtotal_cents' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['zip_code' => preg_replace('/\D/', '', (string) $this->input('zip_code'))]);
    }
}
