<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('demo:reset', function () {
    // This wipes the database, so it only ever runs where the deployment opted in
    if (! config('app.demo_reset')) {
        $this->error('DEMO_RESET está desligado: nada foi alterado.');

        return 1;
    }

    return $this->call('migrate:fresh', ['--seed' => true, '--force' => true]);
})->purpose('Recreate the public demo database');

Schedule::command('demo:reset')
    ->dailyAt('03:00')
    ->timezone('America/Sao_Paulo')
    ->when(fn () => config('app.demo_reset'));
