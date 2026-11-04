<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    private const LOW_STOCK_THRESHOLD = 5;

    public function __invoke(): JsonResponse
    {
        $revenueOrders = fn () => Order::whereIn('status', OrderStatus::revenueStatuses());

        return response()->json(['data' => [
            'revenue_cents' => (int) $revenueOrders()->sum('total_cents'),
            'revenue_orders_count' => $revenueOrders()->count(),
            'orders_by_status' => Order::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
            'sales_last_30_days' => $revenueOrders()
                ->where('created_at', '>=', now()->subDays(30))
                ->selectRaw('DATE(created_at) as date, count(*) as orders, sum(total_cents) as revenue_cents')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(fn ($row) => [
                    'date' => $row->date,
                    'orders' => (int) $row->orders,
                    'revenue_cents' => (int) $row->revenue_cents,
                ]),
            'top_products' => OrderItem::whereHas('order', fn ($query) => $query->whereIn('status', OrderStatus::revenueStatuses()))
                ->selectRaw('product_name, sum(quantity) as units')
                ->groupBy('product_name')
                ->orderByDesc('units')
                ->limit(5)
                ->get()
                ->map(fn ($row) => ['product_name' => $row->product_name, 'units' => (int) $row->units]),
            'low_stock' => Product::active()
                ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
                ->orderBy('stock')
                ->limit(10)
                ->get(['id', 'name', 'stock']),
        ]]);
    }
}
