<?php

use App\Actions\Orders\CreateOrderAction;
use App\Enums\PaymentMethod;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Validation\ValidationException;

require __DIR__.'/../../vendor/autoload.php';

$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$user = User::findOrFail($argv[1]);

try {
    $app->make(CreateOrderAction::class)->handle($user, $user->addresses()->firstOrFail(), PaymentMethod::Pix);
    echo 'ordered';
} catch (ValidationException) {
    echo 'rejected';
}
