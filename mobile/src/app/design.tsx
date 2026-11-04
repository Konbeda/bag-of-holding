import { Redirect } from 'expo-router';
import { Bell, CreditCard, Mail, PackageSearch, Search, ShoppingBag, Trash2 } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  Chip,
  Container,
  D20Loader,
  Divider,
  EmptyState,
  IconButton,
  Input,
  Logo,
  Price,
  QuantityStepper,
  RadioOption,
  showToast,
  Skeleton,
  Text,
} from '@/components/ui';
import { formatDate } from '@/lib/format';
import { colors } from '@/theme';

const swatches = [
  ['Violeta', colors.primary.DEFAULT],
  ['Violeta claro', colors.primary.soft],
  ['Texto', colors.ink.DEFAULT],
  ['Texto suave', colors.ink.muted],
  ['Borda', colors.line.DEFAULT],
  ['Superfície', colors.surface],
  ['Erro', colors.danger.DEFAULT],
  ['Sucesso', colors.success.DEFAULT],
  ['Atenção', colors.warning.DEFAULT],
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-4">
      <Text variant="h2">{title}</Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap items-center gap-3">{children}</View>;
}

export default function DesignScreen() {
  const [quantity, setQuantity] = useState(2);
  const [chip, setChip] = useState('Dados');
  const [payment, setPayment] = useState('pix');
  const [saving, setSaving] = useState(false);

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <ScrollView className="flex-1 bg-white">
      <Container className="gap-10 py-10">
        <View className="gap-2">
          <Logo />
          <Text tone="muted">Base visual da loja, disponível só em desenvolvimento.</Text>
        </View>

        <Section title="Cores">
          <Row>
            {swatches.map(([name, value]) => (
              <View key={name} className="w-24 gap-1.5">
                <View className="h-14 rounded-md border border-line" style={{ backgroundColor: value }} />
                <Text variant="caption" weight="medium">
                  {name}
                </Text>
                <Text variant="caption" tone="muted">
                  {value}
                </Text>
              </View>
            ))}
          </Row>
        </Section>

        <Section title="Tipografia">
          <View className="gap-2">
            <Text variant="display">O dado está lançado</Text>
            <Text variant="h1">Dados e acessórios</Text>
            <Text variant="h2">Lançamentos da semana</Text>
            <Text variant="h3">Conjunto de dados Forja Rúnica</Text>
            <Text>Sete dados de resina com numeração gravada, prontos para a próxima sessão.</Text>
            <Text variant="small" tone="muted">
              Entrega para todo o Brasil, com frete grátis a partir de R$ 300,00.
            </Text>
            <Text variant="caption" tone="muted">
              Pedido feito em {formatDate('2026-11-04T12:00:00')}
            </Text>
          </View>
        </Section>

        <Section title="Botões">
          <Row>
            <Button icon={ShoppingBag}>Adicionar ao carrinho</Button>
            <Button variant="secondary">Continuar comprando</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="danger" icon={Trash2}>
              Remover
            </Button>
          </Row>
          <Row>
            <Button size="sm">Pequeno</Button>
            <Button size="md">Médio</Button>
            <Button size="lg">Grande</Button>
            <Button disabled>Indisponível</Button>
            <Button
              loading={saving}
              onPress={() => {
                setSaving(true);
                setTimeout(() => setSaving(false), 1500);
              }}
            >
              {saving ? 'Salvando' : 'Salvar'}
            </Button>
          </Row>
          <Row>
            <IconButton icon={Search} label="Buscar" />
            <IconButton icon={ShoppingBag} label="Carrinho" variant="secondary" badge={3} />
            <IconButton icon={Bell} label="Avisos" size="sm" />
            <IconButton icon={Bell} label="Avisos" disabled />
          </Row>
        </Section>

        <Section title="Formulário">
          <View className="max-w-md gap-4">
            <Input label="E-mail" placeholder="voce@exemplo.com" icon={Mail} hint="Usado para entrar na sua conta." />
            <Input label="Senha" defaultValue="segredo123" secureTextEntry />
            <Input label="CEP" defaultValue="00000" error="Informe um CEP válido." />
            <Input label="Cidade" defaultValue="Curitiba" editable={false} />
          </View>
          <View role="radiogroup" aria-label="Forma de pagamento" className="max-w-md gap-2">
            <RadioOption
              label="Pix"
              description="Confirmação na hora"
              selected={payment === 'pix'}
              onPress={() => setPayment('pix')}
            />
            <RadioOption
              label="Cartão de crédito"
              description="Pagamento simulado"
              selected={payment === 'card'}
              onPress={() => setPayment('card')}
            />
          </View>
          <Row>
            {['Dados', 'Miniaturas', 'Livros e sistemas'].map((name) => (
              <Chip key={name} selected={chip === name} onPress={() => setChip(name)}>
                {name}
              </Chip>
            ))}
          </Row>
          <QuantityStepper value={quantity} onChange={setQuantity} max={5} />
        </Section>

        <Section title="Dados da loja">
          <Row>
            <Price cents={8990} size="sm" />
            <Price cents={8990} />
            <Price cents={8990} compareAtCents={11990} size="lg" />
          </Row>
          <Row>
            <Badge>Novo</Badge>
            <Badge tone="primary">Destaque</Badge>
            <Badge tone="success">Pago</Badge>
            <Badge tone="warning">Últimas unidades</Badge>
            <Badge tone="danger">Esgotado</Badge>
          </Row>
          <Card className="max-w-md gap-3 p-4">
            <Text variant="h3">Resumo do pedido</Text>
            <Divider />
            <View className="flex-row items-center justify-between">
              <Text variant="small" tone="muted">
                Total
              </Text>
              <Price cents={17980} />
            </View>
            <Button icon={CreditCard} fullWidth>
              Finalizar compra
            </Button>
          </Card>
        </Section>

        <Section title="Estados">
          <Row>
            <D20Loader />
          </Row>
          <View className="max-w-xs gap-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </View>
          <Card>
            <EmptyState
              icon={PackageSearch}
              title="Nenhum produto encontrado"
              description="Tente buscar por outro termo ou remova alguns filtros."
            >
              <Button variant="secondary" size="sm" className="self-center">
                Limpar filtros
              </Button>
            </EmptyState>
          </Card>
          <Row>
            <Button variant="secondary" onPress={() => showToast('Produto adicionado ao carrinho.', 'success')}>
              Aviso de sucesso
            </Button>
            <Button variant="secondary" onPress={() => showToast('Não foi possível salvar.', 'error')}>
              Aviso de erro
            </Button>
          </Row>
        </Section>
      </Container>
    </ScrollView>
  );
}
