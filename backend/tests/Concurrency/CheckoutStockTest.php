<?php

use App\Models\Order;
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Process;

beforeAll(function () {
    $pdo = new PDO("mysql:host={$_ENV['DB_HOST']};port=3306", $_ENV['DB_USERNAME'], $_ENV['DB_PASSWORD']);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$_ENV['DB_DATABASE']}`");
});

it('never oversells when customers compete for the last units', function () {
    expect(DB::getDatabaseName())->toBe('bag_of_holding_test');

    Artisan::call('migrate:fresh');

    $stock = 3;
    $buyers = 10;
    $product = product(['stock' => $stock]);
    $users = collect(range(1, $buyers))->map(fn () => customerWithCart([$product->id => 1]));

    $results = Process::pool(function (Pool $pool) use ($users) {
        foreach ($users as $user) {
            $pool->path(base_path())->timeout(60)->command(['php', 'tests/Concurrency/checkout_worker.php', (string) $user->id]);
        }
    })->start()->wait();

    $outputs = collect($results->collect())->map(fn ($result) => trim($result->output()));

    expect($outputs->countBy()->all())->toEqual(['ordered' => $stock, 'rejected' => $buyers - $stock])
        ->and($product->fresh()->stock)->toBe(0)
        ->and(Order::count())->toBe($stock);
});
