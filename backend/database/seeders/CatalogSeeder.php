<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    private const CATEGORIES = [
        'dados' => ['Dados', '#EEF2FF', '<polygon points="200,90 290,145 290,255 200,310 110,255 110,145" fill="none" stroke="#4C1D95" stroke-width="10" stroke-linejoin="round"/><polygon points="200,130 255,225 145,225" fill="none" stroke="#4C1D95" stroke-width="8" stroke-linejoin="round"/>'],
        'livros-e-sistemas' => ['Livros e Sistemas', '#F5F3FF', '<rect x="125" y="90" width="150" height="220" rx="10" fill="none" stroke="#4C1D95" stroke-width="10"/><path d="M155 90v220M185 150h60M185 180h60" stroke="#4C1D95" stroke-width="8" stroke-linecap="round"/>'],
        'miniaturas' => ['Miniaturas', '#FAF5FF', '<circle cx="200" cy="130" r="38" fill="none" stroke="#4C1D95" stroke-width="10"/><path d="M150 265c0-55 20-90 50-90s50 35 50 90" fill="none" stroke="#4C1D95" stroke-width="10"/><rect x="125" y="265" width="150" height="26" rx="13" fill="none" stroke="#4C1D95" stroke-width="10"/>'],
        'acessorios-de-mesa' => ['Acessórios de Mesa', '#F4F4F5', '<rect x="100" y="110" width="200" height="180" rx="10" fill="none" stroke="#4C1D95" stroke-width="10"/><path d="M100 170h200M100 230h200M167 110v180M233 110v180" stroke="#4C1D95" stroke-width="6"/>'],
        'kits-para-iniciantes' => ['Kits para Iniciantes', '#F3EEFC', '<rect x="105" y="150" width="190" height="140" rx="10" fill="none" stroke="#4C1D95" stroke-width="10"/><path d="M105 195h190M200 150v140M200 150c-30-60-80-40-55 0M200 150c30-60 80-40 55 0" fill="none" stroke="#4C1D95" stroke-width="8" stroke-linecap="round"/>'],
    ];

    private const BRANDS = ['Forja Rúnica', 'Pergaminho Editorial', 'Ateliê Goblin', 'Lança & Escudo', 'Mesa Alta'];

    // Each row: category, brand, name, price, previous price, stock, featured, description, specifications
    private const PRODUCTS = [
        ['dados', 'Forja Rúnica', 'Conjunto de Dados Noite Estrelada', 5990, 7490, 42, true, 'Sete dados poliédricos em resina translúcida com pigmento azul e pontos de glitter. Números dourados de alto contraste.', ['Material' => 'Resina', 'Peças' => '7']],
        ['dados', 'Forja Rúnica', 'Conjunto de Dados Metal Ancião', 18990, null, 12, true, 'Dados maciços em liga metálica com acabamento envelhecido. Peso marcante e rolagem precisa, acompanham estojo rígido.', ['Material' => 'Liga metálica', 'Peças' => '7']],
        ['dados', 'Lança & Escudo', 'Conjunto de Dados Clássico Marfim', 3490, null, 80, false, 'O conjunto essencial para qualquer mesa, em acrílico marfim com números pretos fáceis de ler.', ['Material' => 'Acrílico', 'Peças' => '7']],
        ['dados', 'Lança & Escudo', 'Pack com 10 Dados de Seis Lados', 2990, null, 65, false, 'Dez dados de seis lados em tamanho padrão, perfeitos para sistemas que rolam parada de dados.', ['Material' => 'Acrílico', 'Peças' => '10']],
        ['dados', 'Forja Rúnica', 'D20 Gigante de Mesa', 4490, null, 18, false, 'Um d20 de 55 mm para marcar momentos decisivos da campanha. Peça de destaque em qualquer mesa.', ['Material' => 'Acrílico', 'Diâmetro' => '55 mm']],
        ['dados', 'Ateliê Goblin', 'Conjunto de Dados Pedra Vulcânica', 14990, 16990, 4, false, 'Sete dados lapidados em pedra natural vulcânica, cada conjunto com textura única.', ['Material' => 'Pedra natural', 'Peças' => '7']],
        ['dados', 'Ateliê Goblin', 'Conjunto de Dados Madeira Viva', 12990, null, 9, false, 'Dados entalhados em madeira nobre com números gravados a laser e acabamento em óleo natural.', ['Material' => 'Madeira', 'Peças' => '7']],
        ['dados', 'Lança & Escudo', 'Bolsa de Dados em Veludo', 2490, null, 120, false, 'Bolsa com fechamento em cordão e forro macio, com espaço para até três conjuntos.', ['Material' => 'Veludo']],
        ['dados', 'Mesa Alta', 'Torre de Dados Dobrável', 8990, null, 25, true, 'Torre em MDF que dobra e vira um estojo plano. Evita dados caindo da mesa e rolagens suspeitas.', ['Material' => 'MDF', 'Altura' => '24 cm']],

        ['livros-e-sistemas', 'Pergaminho Editorial', 'Crônicas de Aethel: Livro Básico', 19990, 22990, 30, true, 'O livro central do cenário de Aethel, com regras completas, criação de personagem e guia de campanha em capa dura.', ['Páginas' => '320', 'Capa' => 'Dura']],
        ['livros-e-sistemas', 'Pergaminho Editorial', 'Crônicas de Aethel: Bestiário', 15990, null, 22, false, 'Mais de 200 criaturas do mundo de Aethel, com fichas prontas e ganchos de aventura.', ['Páginas' => '240', 'Capa' => 'Dura']],
        ['livros-e-sistemas', 'Pergaminho Editorial', 'Crônicas de Aethel: Guia do Narrador', 16990, null, 15, false, 'Ferramentas para conduzir campanhas longas: facções, tabelas de encontros e conselhos de narração.', ['Páginas' => '256', 'Capa' => 'Dura']],
        ['livros-e-sistemas', 'Pergaminho Editorial', 'Sombras de Neon: Livro de Regras', 17990, null, 28, true, 'RPG cyberpunk ambientado em uma metrópole sul-americana, com sistema narrativo ágil e hacking simples.', ['Páginas' => '288', 'Capa' => 'Dura']],
        ['livros-e-sistemas', 'Mesa Alta', 'Vale dos Sussurros: Aventura de Horror', 8990, null, 19, false, 'Aventura de horror investigativo para quatro sessões, com mapas, pistas e personagens prontos.', ['Páginas' => '96', 'Capa' => 'Flexível']],
        ['livros-e-sistemas', 'Mesa Alta', 'Tabelas Aleatórias para Mestres Sem Tempo', 6990, 7990, 40, false, 'Centenas de tabelas de nomes, tavernas, tesouros e complicações para improvisar em qualquer cenário.', ['Páginas' => '128', 'Capa' => 'Flexível']],
        ['livros-e-sistemas', 'Pergaminho Editorial', 'Mar de Ferro: Cenário de Campanha', 14990, null, 3, false, 'Cenário de piratas e navios a vapor, compatível com os principais sistemas de fantasia.', ['Páginas' => '200', 'Capa' => 'Dura']],
        ['livros-e-sistemas', 'Mesa Alta', 'Cinco Tochas: RPG Minimalista', 4990, null, 55, false, 'Regras em poucas páginas para masmorras rápidas, ideal para sessões únicas e novos grupos.', ['Páginas' => '48', 'Capa' => 'Flexível']],
        ['livros-e-sistemas', 'Pergaminho Editorial', 'Diário de Campanha', 5490, null, 70, false, 'Caderno com páginas pautadas e pontilhadas para registrar sessões, personagens e mapas.', ['Páginas' => '160', 'Capa' => 'Dura']],

        ['miniaturas', 'Ateliê Goblin', 'Miniatura Guerreira Anã', 3990, null, 35, false, 'Miniatura em resina de alta definição na escala 32 mm, pronta para pintar.', ['Escala' => '32 mm', 'Material' => 'Resina']],
        ['miniaturas', 'Ateliê Goblin', 'Miniatura Maga Elfa', 3990, null, 32, false, 'Conjuradora em pose de combate, com detalhes finos em manto e cajado.', ['Escala' => '32 mm', 'Material' => 'Resina']],
        ['miniaturas', 'Ateliê Goblin', 'Grupo de Aventureiros com 5 Miniaturas', 15990, 18990, 14, true, 'Cinco miniaturas prontas para a mesa: guerreira, mago, ladino, clériga e arqueiro.', ['Escala' => '32 mm', 'Peças' => '5']],
        ['miniaturas', 'Ateliê Goblin', 'Dragão de Bronze Colossal', 44990, 49990, 2, true, 'Peça central de campanha, com 28 cm de envergadura e encaixes magnéticos nas asas.', ['Escala' => '32 mm', 'Envergadura' => '28 cm']],
        ['miniaturas', 'Forja Rúnica', 'Horda de Goblins com 12 Miniaturas', 11990, null, 21, false, 'Doze goblins em poses variadas para encher qualquer encontro de caos.', ['Escala' => '32 mm', 'Peças' => '12']],
        ['miniaturas', 'Forja Rúnica', 'Esqueletos da Cripta com 10 Miniaturas', 9990, null, 26, false, 'Dez guerreiros mortos-vivos com armas e escudos variados.', ['Escala' => '32 mm', 'Peças' => '10']],
        ['miniaturas', 'Lança & Escudo', 'Kit de Pintura para Miniaturas', 12990, null, 17, false, 'Doze tintas acrílicas, três pincéis, primer e um guia ilustrado de técnicas básicas.', ['Tintas' => '12', 'Pincéis' => '3']],
        ['miniaturas', 'Lança & Escudo', 'Bases Redondas de 25 mm com 50 Unidades', 3490, null, 90, false, 'Bases plásticas lisas e empilháveis, compatíveis com a maioria das miniaturas de 32 mm.', ['Diâmetro' => '25 mm', 'Peças' => '50']],

        ['acessorios-de-mesa', 'Mesa Alta', 'Escudo do Mestre Modular', 9990, null, 33, true, 'Quatro painéis rígidos com bolsos transparentes para personalizar com as tabelas do seu sistema.', ['Painéis' => '4', 'Material' => 'Cartão rígido']],
        ['acessorios-de-mesa', 'Mesa Alta', 'Grid de Batalha Apagável', 11990, 13990, 27, true, 'Tapete de neoprene com grade de 2,5 cm, compatível com marcadores de quadro branco.', ['Tamanho' => '60 × 90 cm', 'Material' => 'Neoprene']],
        ['acessorios-de-mesa', 'Lança & Escudo', 'Bandeja de Rolagem em Couro Sintético', 6990, null, 44, false, 'Bandeja dobrável com botões de pressão, que mantém os dados no lugar e abafa o som.', ['Material' => 'Couro sintético']],
        ['acessorios-de-mesa', 'Lança & Escudo', 'Marcadores de Condição com 60 Peças', 4490, null, 58, false, 'Anéis coloridos e tokens em acrílico para atordoado, envenenado, caído e outras condições.', ['Material' => 'Acrílico', 'Peças' => '60']],
        ['acessorios-de-mesa', 'Mesa Alta', 'Bloco de Fichas de Personagem', 2990, null, 110, false, 'Cinquenta fichas universais em papel de alta gramatura, que aguentam muitas borrachadas.', ['Folhas' => '50']],
        ['acessorios-de-mesa', 'Forja Rúnica', 'Contador de Vida Magnético', 3990, null, 39, false, 'Contador com dois discos giratórios e base magnética para acompanhar pontos de vida e recursos.', ['Material' => 'Metal']],
        ['acessorios-de-mesa', 'Ateliê Goblin', 'Conjunto de Terrenos: Taverna', 16990, null, 8, false, 'Paredes, mesas e barris em MDF cortado a laser para montar uma taverna completa.', ['Material' => 'MDF', 'Peças' => '34']],
        ['acessorios-de-mesa', 'Lança & Escudo', 'Maleta Organizadora de Miniaturas', 13990, null, 0, false, 'Maleta com espuma recortável para transportar até 60 miniaturas com segurança.', ['Capacidade' => '60 miniaturas']],

        ['kits-para-iniciantes', 'Pergaminho Editorial', 'Caixa Inicial Crônicas de Aethel', 14990, 17990, 37, true, 'Tudo para começar: regras simplificadas, aventura, personagens prontos, dados e mapas.', ['Jogadores' => '2 a 5', 'Sessões' => '4']],
        ['kits-para-iniciantes', 'Mesa Alta', 'Kit Primeiro Mestre', 19990, null, 16, false, 'Escudo, grid, marcadores e guia de narração para quem vai conduzir a primeira campanha.', ['Itens' => '6']],
        ['kits-para-iniciantes', 'Lança & Escudo', 'Kit Primeiro Jogador', 7990, null, 48, false, 'Conjunto de dados, bolsa, fichas e lápis para chegar preparado à primeira sessão.', ['Itens' => '4']],
        ['kits-para-iniciantes', 'Pergaminho Editorial', 'Caixa Inicial Sombras de Neon', 13990, null, 11, false, 'Introdução ao cenário cyberpunk com missão pronta, fichas e cartas de equipamento.', ['Jogadores' => '2 a 4', 'Sessões' => '3']],
        ['kits-para-iniciantes', 'Forja Rúnica', 'Kit Noite de Jogo', 9990, null, 31, false, 'Dois conjuntos de dados, bandeja de rolagem e marcadores para deixar a mesa pronta em minutos.', ['Itens' => '4']],
        ['kits-para-iniciantes', 'Mesa Alta', 'Kit RPG em Família', 11990, 13490, 23, false, 'Regras leves, aventura para todas as idades e dados grandes para uma tarde divertida.', ['Jogadores' => '2 a 6', 'Idade' => '8+']],
    ];

    public function run(): void
    {
        File::ensureDirectoryExists(public_path('images/products'));

        $categories = collect(self::CATEGORIES)->map(
            fn (array $category, string $slug) => Category::updateOrCreate(['slug' => $slug], ['name' => $category[0]])
        );

        $brands = collect(self::BRANDS)->mapWithKeys(
            fn (string $name) => [$name => Brand::updateOrCreate(['slug' => Str::slug($name)], ['name' => $name])]
        );

        foreach (self::PRODUCTS as [$category, $brand, $name, $price, $previousPrice, $stock, $featured, $description, $specifications]) {
            $slug = Str::slug($name);

            $product = Product::updateOrCreate(['slug' => $slug], [
                'category_id' => $categories[$category]->id,
                'brand_id' => $brands[$brand]->id,
                'name' => $name,
                'description' => $description,
                'price_cents' => $price,
                'compare_at_price_cents' => $previousPrice,
                'stock' => $stock,
                'is_featured' => $featured,
                'specifications' => $specifications,
            ]);

            File::put(public_path("images/products/{$slug}.svg"), $this->artwork($category));

            $product->images()->updateOrCreate(['position' => 0], [
                'path' => "images/products/{$slug}.svg",
                'alt' => $name,
            ]);
        }
    }

    private function artwork(string $category): string
    {
        [, $background, $shape] = self::CATEGORIES[$category];

        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="'.$background.'"/>'.$shape.'</svg>';
    }
}
