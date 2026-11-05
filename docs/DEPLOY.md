# Como publicar

O projeto ainda não está publicado. Este guia descreve o que já está pronto e o que falta fazer.

São três partes:

- **API:** a imagem Docker em [docker/production/Dockerfile](../docker/production/Dockerfile) roda Nginx, PHP-FPM e o agendador em um único container.
- **Banco:** qualquer MySQL 8 acessível pela API.
- **Site:** arquivos estáticos gerados pelo Expo.

## API

Configure a hospedagem para construir a imagem a partir da raiz do repositório:

```bash
docker build -f docker/production/Dockerfile -t bag-of-holding-api .
```

Variáveis de ambiente:

| Variável | Valor |
|---|---|
| `APP_KEY` | chave gerada com `php artisan key:generate --show` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | endereço público da API |
| `APP_LOCALE` | `pt_BR` |
| `LOG_CHANNEL` | `stderr` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | dados do banco |
| `SESSION_DRIVER`, `CACHE_STORE` | `database` |
| `TRUSTED_PROXIES` | `*`, se a hospedagem terminar o https em um proxy |
| `DEMO_PASSWORD` | senha das contas de demonstração |
| `DEMO_RESET` | `true` somente na demonstração pública |
| `PORT` | porta do container, se a hospedagem definir outra além de 8080 |

Ao iniciar, o container roda as migrações e o seed. O seed recria as imagens dos produtos, que ficam no disco do container, e restaura os dados do catálogo e as senhas das contas de demonstração.

## Demonstração pública

O login de admin fica aberto para que visitantes vejam o painel, então qualquer pessoa pode alterar produtos e pedidos.

Com `DEMO_RESET=true`, o comando `demo:reset` recria o banco todo dia às 3h (horário de Brasília). Isso desfaz as alterações, encerra as sessões e mantém o gráfico de vendas com datas recentes.

**Esse comando apaga o banco inteiro.** Use a variável apenas em um banco dedicado à demonstração.

## Site

```bash
cd mobile
```

```bash
EXPO_PUBLIC_API_URL=https://endereco-da-api/api/v1 npm run build:web
```

Publique a pasta `mobile/dist`. O arquivo `public/_redirects` já faz as rotas abrirem no site em hospedagens compatíveis, como o Cloudflare Pages. Em outras, configure o redirecionamento de todas as rotas para `index.html`.

## APK de demonstração

O APK precisa de uma conta na Expo e do endereço final da API. Crie um `mobile/eas.json` com um perfil que gere APK e defina `EXPO_PUBLIC_API_URL` nele, depois rode:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Teste o aplicativo em um aparelho antes de divulgar: ele ainda não foi testado em celular ou emulador.

## Antes de divulgar

1. Crie o repositório no GitHub e confira se a CI passa, porque ela ainda não rodou.
2. Defina um `DEMO_PASSWORD` próprio e atualize o README com os endereços e os logins.
3. Abra o site publicado e faça uma compra completa.
