# Bag of Holding

Loja online mock de produtos para jogadores de RPG, com site e app feitos a partir do mesmo código. É um projeto de portfólio: os produtos e as marcas são fictícios, e o pagamento é simulado.

O plano completo está em [docs/PLANO.md](docs/PLANO.md).

## Stack

- **Backend:** Laravel, Sanctum, MySQL e Pest, rodando em Docker.
- **Frontend:** Expo, Expo Router, React Native Web, NativeWind, TanStack Query e Zustand.

## Como rodar

É preciso ter Docker e Node.js 24 instalados.

### API

Disponível em `http://localhost:8000/api/v1`.

```bash
cp backend/.env.example backend/.env
```

```bash
docker compose up -d --build
```

```bash
docker compose exec app composer install
```

```bash
docker compose exec app php artisan key:generate
```

```bash
docker compose exec app php artisan migrate
```

### Site e app

```bash
cd mobile
```

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run web
```

## Testes e qualidade

```bash
docker compose exec app php artisan test
```

```bash
docker compose exec app vendor/bin/pint --test
```

```bash
npm --prefix mobile run lint
```

```bash
npm --prefix mobile run typecheck
```
