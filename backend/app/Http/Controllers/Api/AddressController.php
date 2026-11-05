<?php

namespace App\Http\Controllers\Api;

use App\Actions\Addresses\SaveAddressAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\AddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class AddressController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return AddressResource::collection(
            $request->user()->addresses()->orderByDesc('is_default')->latest('id')->get()
        );
    }

    public function store(AddressRequest $request, SaveAddressAction $save): JsonResponse
    {
        $address = $save->handle($request->user()->addresses()->make(), $request->validated());

        return (new AddressResource($address))->response()->setStatusCode(201);
    }

    public function update(AddressRequest $request, Address $address, SaveAddressAction $save): AddressResource
    {
        Gate::authorize('manage', $address);

        return new AddressResource($save->handle($address, $request->validated()));
    }

    public function destroy(Address $address, SaveAddressAction $save): Response
    {
        Gate::authorize('manage', $address);

        $save->delete($address);

        return response()->noContent();
    }
}
