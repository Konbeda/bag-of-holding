<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'recipient' => ['required', 'string', 'max:255'],
            'zip_code' => ['required', 'digits:8'],
            'street' => ['required', 'string', 'max:255'],
            'number' => ['required', 'string', 'max:20'],
            'complement' => ['nullable', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'size:2', 'alpha'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'zip_code' => preg_replace('/\D/', '', (string) $this->input('zip_code')),
            'state' => mb_strtoupper(trim((string) $this->input('state'))),
        ]);
    }
}
