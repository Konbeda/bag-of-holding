<?php

namespace App\Providers;

use App\Contracts\PaymentGateway;
use App\Services\Payments\FakePaymentGateway;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public array $bindings = [PaymentGateway::class => FakePaymentGateway::class];
}
