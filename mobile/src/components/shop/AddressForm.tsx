import { useRef, useState } from 'react';
import { Switch, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import { type Address, useAddresses, useSaveAddress } from '@/features/addresses/queries';
import { lookupZipCode } from '@/features/addresses/viacep';
import { useSession } from '@/features/auth/session';
import { ApiError, fieldError } from '@/lib/api';
import { formatZipCode } from '@/lib/format';
import { colors } from '@/theme';

type AddressFormProps = {
  address?: Address;
  submitLabel: string;
  onSaved: (address: Address) => void;
};

const lookupHints = {
  idle: 'Preenchemos o endereço a partir do CEP.',
  loading: 'Buscando endereço...',
  missing: 'CEP não encontrado. Preencha o endereço manualmente.',
  failed: 'Não foi possível buscar o CEP. Preencha o endereço manualmente.',
};

export function AddressForm({ address, submitLabel, onSaved }: AddressFormProps) {
  const userName = useSession((state) => state.user?.name ?? '');
  const { data: addresses = [] } = useAddresses();
  const save = useSaveAddress();
  const latestZipCode = useRef('');
  const [lookup, setLookup] = useState<keyof typeof lookupHints>('idle');
  const [isDefault, setIsDefault] = useState(false);
  const [values, setValues] = useState({
    recipient: address?.recipient ?? userName,
    zip_code: formatZipCode(address?.zip_code ?? ''),
    street: address?.street ?? '',
    number: address?.number ?? '',
    complement: address?.complement ?? '',
    district: address?.district ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
  });

  const canChooseDefault = !address?.is_default && addresses.some((other) => other.id !== address?.id);
  const error = save.error;
  const generalError = error instanceof ApiError && Object.keys(error.errors).length > 0 ? null : error?.message;

  const set = (field: keyof typeof values) => (value: string) => setValues((current) => ({ ...current, [field]: value }));

  const changeZipCode = async (value: string) => {
    const formatted = formatZipCode(value);
    const digits = formatted.replace(/\D/g, '');

    latestZipCode.current = digits;
    set('zip_code')(formatted);

    if (digits.length < 8) {
      setLookup('idle');
      return;
    }

    setLookup('loading');

    try {
      const found = await lookupZipCode(digits);

      // A slower answer for a previous CEP must not overwrite the current one
      if (latestZipCode.current !== digits) return;

      setLookup(found ? 'idle' : 'missing');

      if (found) {
        setValues((current) => ({
          ...current,
          street: found.street || current.street,
          district: found.district || current.district,
          city: found.city || current.city,
          state: found.state || current.state,
        }));
      }
    } catch {
      if (latestZipCode.current === digits) setLookup('failed');
    }
  };

  const submit = () => {
    save.mutate(
      {
        id: address?.id,
        input: { ...values, complement: values.complement.trim() || null, ...(isDefault ? { is_default: true } : {}) },
      },
      { onSuccess: ({ data }) => onSaved(data) },
    );
  };

  return (
    <View className="gap-4">
      <Input
        label="Destinatário"
        value={values.recipient}
        onChangeText={set('recipient')}
        autoComplete="name"
        error={fieldError(error, 'recipient')}
      />
      <Input
        label="CEP"
        placeholder="00000-000"
        keyboardType="number-pad"
        autoComplete="postal-code"
        value={values.zip_code}
        onChangeText={changeZipCode}
        hint={lookupHints[lookup]}
        error={fieldError(error, 'zip_code')}
      />
      <Input
        label="Rua"
        value={values.street}
        onChangeText={set('street')}
        autoComplete="street-address"
        error={fieldError(error, 'street')}
      />
      <View className="flex-row items-start gap-3">
        <Input
          label="Número"
          value={values.number}
          onChangeText={set('number')}
          error={fieldError(error, 'number')}
          className="flex-1"
        />
        <Input
          label="Complemento"
          value={values.complement}
          onChangeText={set('complement')}
          error={fieldError(error, 'complement')}
          className="flex-[2]"
        />
      </View>
      <Input
        label="Bairro"
        value={values.district}
        onChangeText={set('district')}
        error={fieldError(error, 'district')}
      />
      <View className="flex-row items-start gap-3">
        <Input
          label="Cidade"
          value={values.city}
          onChangeText={set('city')}
          error={fieldError(error, 'city')}
          className="flex-1"
        />
        <Input
          label="UF"
          value={values.state}
          onChangeText={set('state')}
          autoCapitalize="characters"
          maxLength={2}
          error={fieldError(error, 'state')}
          className="w-20"
        />
      </View>
      {canChooseDefault && (
        <View className="flex-row items-center justify-between gap-3">
          <Text variant="small" weight="medium">
            Usar como endereço principal
          </Text>
          <Switch
            aria-label="Usar como endereço principal"
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ true: colors.primary.DEFAULT, false: colors.line.strong }}
            thumbColor="#FFFFFF"
          />
        </View>
      )}
      {generalError && (
        <Text role="alert" variant="small" tone="danger">
          {generalError}
        </Text>
      )}
      <Button size="lg" fullWidth loading={save.isPending} onPress={submit}>
        {submitLabel}
      </Button>
    </View>
  );
}
