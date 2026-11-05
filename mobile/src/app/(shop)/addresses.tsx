import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AddressForm } from '@/components/shop/AddressForm';
import { AddressLines } from '@/components/shop/AddressLines';
import { ErrorState } from '@/components/shop/ErrorState';
import { Footer } from '@/components/shop/Footer';
import { PageTitle } from '@/components/shop/PageTitle';
import { RequireAuth } from '@/components/shop/RequireAuth';
import { Badge, Button, Card, Container, D20Loader, EmptyState, Sheet, showToast, Text } from '@/components/ui';
import { type Address, useAddresses, useDeleteAddress, useSaveAddress } from '@/features/addresses/queries';

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const save = useSaveAddress();

  const makeDefault = () => {
    const { id, ...input } = address;

    save.mutate(
      { id, input: { ...input, is_default: true } },
      { onError: (error) => showToast(error.message, 'error') },
    );
  };

  return (
    <Card className="gap-3 p-4">
      {address.is_default && <Badge tone="primary">Principal</Badge>}
      <AddressLines address={address} />
      <View className="flex-row flex-wrap gap-2">
        <Button variant="secondary" size="sm" icon={Pencil} onPress={onEdit} aria-label={`Editar endereço de ${address.street}`}>
          Editar
        </Button>
        <Button variant="secondary" size="sm" icon={Trash2} onPress={onDelete} aria-label={`Excluir endereço de ${address.street}`}>
          Excluir
        </Button>
        {!address.is_default && (
          <Button variant="ghost" size="sm" loading={save.isPending} onPress={makeDefault}>
            Tornar principal
          </Button>
        )}
      </View>
    </Card>
  );
}

function AddressBook() {
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const remove = useDeleteAddress();
  // The sheets keep their address while closing, so the content stays in place during the fade
  const [editing, setEditing] = useState<{ open: boolean; address?: Address }>({ open: false });
  const [deleting, setDeleting] = useState<{ open: boolean; address?: Address }>({ open: false });

  const closeEdit = () => setEditing((current) => ({ ...current, open: false }));
  const closeDelete = () => {
    setDeleting((current) => ({ ...current, open: false }));
    remove.reset();
  };

  if (isLoading) {
    return (
      <View className="items-center py-16">
        <D20Loader />
      </View>
    );
  }

  if (isError || !addresses) return <ErrorState onRetry={refetch} />;

  return (
    <View className="gap-4">
      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="Nenhum endereço salvo" description="Cadastre um endereço para receber os seus pedidos.">
          <Button className="self-center" icon={Plus} onPress={() => setEditing({ open: true })}>
            Novo endereço
          </Button>
        </EmptyState>
      ) : (
        <>
          <Button variant="secondary" icon={Plus} onPress={() => setEditing({ open: true })}>
            Novo endereço
          </Button>
          <View className="gap-4 md:flex-row md:flex-wrap">
            {addresses.map((address) => (
              <View key={address.id} className="md:w-[48%]">
                <AddressCard
                  address={address}
                  onEdit={() => setEditing({ open: true, address })}
                  onDelete={() => setDeleting({ open: true, address })}
                />
              </View>
            ))}
          </View>
        </>
      )}

      <Sheet visible={editing.open} title={editing.address ? 'Editar endereço' : 'Novo endereço'} onClose={closeEdit}>
        <AddressForm
          address={editing.address}
          submitLabel="Salvar endereço"
          onSaved={() => {
            closeEdit();
            showToast('Endereço salvo.', 'success');
          }}
        />
      </Sheet>

      <Sheet visible={deleting.open} title="Excluir endereço" onClose={closeDelete}>
        {deleting.address && (
          <View className="gap-4">
            <AddressLines address={deleting.address} />
            <Text variant="small" tone="muted">
              Pedidos já feitos para este endereço não mudam.
            </Text>
            {remove.error && (
              <Text role="alert" variant="small" tone="danger">
                {remove.error.message}
              </Text>
            )}
            <Button
              variant="danger"
              fullWidth
              loading={remove.isPending}
              onPress={() =>
                remove.mutate(deleting.address!.id, {
                  onSuccess: () => {
                    closeDelete();
                    showToast('Endereço excluído.', 'success');
                  },
                })
              }
            >
              Excluir endereço
            </Button>
          </View>
        )}
      </Sheet>
    </View>
  );
}

export default function AddressesScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <PageTitle title="Endereços | Bag of Holding" />
      <Container className="gap-6 pt-4 md:pt-8">
        <Text variant="h1">Endereços</Text>
        <RequireAuth>
          <AddressBook />
        </RequireAuth>
      </Container>
      <Footer />
    </ScrollView>
  );
}
