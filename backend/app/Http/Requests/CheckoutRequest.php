<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Services\Payments\FakePaymentGateway;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'address_id' => ['required', 'integer', Rule::exists('addresses', 'id')->where('user_id', $this->user()->id)],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'simulated_outcome' => ['required', Rule::in(FakePaymentGateway::OUTCOMES)],
        ];
    }
}
