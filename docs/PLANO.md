# Bag of Holding: plano do projeto

Loja online mock e realista de produtos para jogadores de RPG, feita para portfólio. Tem site e app com o mesmo código.

## Convenções

- **Idioma do código:** inglês (nomes, rotas, tabelas, commits).
- **Comentários:** no máximo 1 linha.
- **Idioma da loja:** tudo em português do Brasil, incluindo textos da interface, dados do seed, e-mails e mensagens de erro e validação da API.
- **Formatos:** moeda em BRL e datas no padrão brasileiro.

## Escopo

Os produtos e as marcas do catálogo são fictícios, e o pagamento é simulado.

**Categorias:** dados, livros e sistemas, miniaturas, acessórios de mesa e kits para iniciantes.

**Cliente:** catálogo com busca e filtros, carrinho, checkout, histórico de pedidos e endereços.

**Admin:** produtos, estoque, pedidos e painel de vendas.

**Fora desta versão (podem entrar depois):** avaliações, favoritos e cupons.

**Fora do escopo:** pagamento real, emissão de nota fiscal e marketplace.

## Estrutura do repositório

```
/
├── backend/            # Laravel API
├── mobile/             # Expo app and website
├── docker-compose.yml  # PHP, Nginx and MySQL
├── docs/               # plan, decisions and API collection
└── README.md
```

A máquina de desenvolvimento não tem PHP, Composer nem MySQL, então o backend roda em Docker.

## Backend

**Base:** Laravel na versão estável atual, MySQL 8, Sanctum e testes com Pest.

**Organização:** controllers enxutos, Form Requests para validação, API Resources nas respostas, Policies para permissões e Actions para as regras de negócio (por exemplo, `CreateOrderAction`).

### Tabelas

| Domínio | Tabelas |
|---|---|
| Usuários | `users` (papel cliente/admin), `addresses` |
| Catálogo | `categories`, `brands`, `products`, `product_images` |
| Compra | `carts`, `cart_items` |
| Pedidos | `orders`, `order_items`, `payments` |

### Regras de negócio

- **Preços:** em centavos, como inteiros.
- **Histórico:** o pedido guarda uma cópia do nome, do preço e do endereço.
- **Estoque:** a baixa ocorre em uma transação com `lockForUpdate`.
- **Pagamento:** interface `PaymentGateway` com implementação simulada. O checkout não pede dados reais de cartão: o usuário escolhe o resultado (aprovado ou recusado).
- **Status do pedido:** `pending → paid → shipped → delivered`, com `canceled`, que devolve o estoque. As transições são validadas no backend.

### Rotas (`/api/v1`)

- **Públicas:** `auth`, `products` (filtros, ordenação e paginação), `categories`, `brands`, `shipping/quote`.
- **Com login:** `me`, `addresses`, `cart`, `checkout`, `orders`.
- **Admin:** `admin/products`, `admin/orders`, `admin/dashboard`.

## Frontend

**Base:** Expo Router, TypeScript, TanStack Query para dados da API, Zustand para estado local e NativeWind para estilo.

```
mobile/src/
├── app/
│   ├── (shop)/      # home, catalog, product, cart
│   ├── (auth)/      # login, sign-up
│   ├── (account)/   # orders, addresses
│   ├── checkout/
│   └── admin/
├── components/      # ui/ (design system) and per domain
├── features/        # API calls and hooks per domain
├── theme/           # colors, typography, spacing
└── lib/             # API client, auth, formatting
```

- **Responsividade:** no site, header completo e grid largo; no app, abas inferiores.
- **Carrinho:** visitantes usam um carrinho local, que é unido ao da conta no login.
- **Endereço e frete:** ViaCEP de verdade para o endereço e frete calculado por uma tabela simulada por região.
- **Admin:** focado no site.

## Identidade visual

Estética clean e moderna.

- **Base:** fundo branco, tons de cinza neutros e bastante espaço em branco.
- **Destaque:** uma única cor, violeta profundo, reservada para ações principais e estados ativos.
- **Tipografia:** uma sans moderna em toda a interface, com a hierarquia feita por peso e tamanho.
- **Componentes:** bordas finas, cantos levemente arredondados e sombras mínimas.
- **Tema de RPG:** aparece nos produtos e em poucos detalhes, como o d20 no indicador de carregamento.

## Fases de execução

1. **Fundação:** repositório, Docker, projetos Laravel e Expo, e CI.
2. **API da loja:** catálogo, auth, carrinho, pedidos e testes, com seed de cerca de 40 produtos.
3. **Design system:** tema e componentes base.
4. **Vitrine:** home, catálogo, produto e carrinho.
5. **Compra e conta:** checkout, pedidos e endereços.
6. **Admin:** painel e gerenciamento.
7. **Publicação:** ajustes finais, deploy (site, API e banco), APK de demonstração, README com prints e conta de demonstração.
