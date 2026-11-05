import { Link, Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { AuthScreen } from '@/components/shop/AuthScreen';
import { Button, Input, Text } from '@/components/ui';
import { signUp } from '@/features/auth/actions';
import { safeRedirect } from '@/features/auth/redirect';
import { useSession } from '@/features/auth/session';
import { ApiError, fieldError } from '@/lib/api';

export default function RegisterScreen() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const user = useSession((state) => state.user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user && !submitting) return <Redirect href={safeRedirect(redirect)} />;

  const submit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await signUp({ name: name.trim(), email: email.trim(), password, password_confirmation: confirmation });
      router.replace(safeRedirect(redirect));
    } catch (failure) {
      setError(failure);
      setSubmitting(false);
    }
  };

  const generalError = error instanceof ApiError && Object.keys(error.errors).length > 0 ? null : error && (error as Error).message;

  return (
    <AuthScreen title="Criar conta" subtitle="Leva menos de um minuto.">
      <PageTitle title="Criar conta | Bag of Holding" />
      <View className="gap-4">
        <Input label="Nome" value={name} onChangeText={setName} autoComplete="name" error={fieldError(error, 'name')} />
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={fieldError(error, 'email')}
        />
        <Input
          label="Senha"
          hint="Pelo menos 8 caracteres."
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          error={fieldError(error, 'password')}
        />
        <Input
          label="Confirmar senha"
          value={confirmation}
          onChangeText={setConfirmation}
          secureTextEntry
          autoComplete="new-password"
          onSubmitEditing={submit}
        />
        {Boolean(generalError) && (
          <Text role="alert" variant="small" tone="danger">
            {String(generalError)}
          </Text>
        )}
        <Button size="lg" fullWidth loading={submitting} onPress={submit}>
          Criar conta
        </Button>
      </View>
      <View className="flex-row flex-wrap justify-center gap-1">
        <Text variant="small" tone="muted">
          Já tem conta?
        </Text>
        <Link href={{ pathname: '/login', params: redirect ? { redirect } : {} }} replace>
          <Text variant="small" weight="medium" tone="primary">
            Entrar
          </Text>
        </Link>
      </View>
    </AuthScreen>
  );
}
