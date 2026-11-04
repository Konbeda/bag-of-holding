import { Link, Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { AuthScreen } from '@/components/shop/AuthScreen';
import { Button, Input, Text } from '@/components/ui';
import { signIn } from '@/features/auth/actions';
import { safeRedirect } from '@/features/auth/redirect';
import { useSession } from '@/features/auth/session';
import { ApiError, fieldError } from '@/lib/api';

export default function LoginScreen() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const user = useSession((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user && !submitting) return <Redirect href={safeRedirect(redirect)} />;

  const submit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
      router.replace(safeRedirect(redirect));
    } catch (failure) {
      setError(failure);
      setSubmitting(false);
    }
  };

  const generalError = error instanceof ApiError && Object.keys(error.errors).length > 0 ? null : error && (error as Error).message;

  return (
    <AuthScreen title="Entrar" subtitle="Acesse a sua conta para finalizar a compra.">
      <PageTitle title="Entrar | Bag of Holding" />
      <View className="gap-4">
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
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          onSubmitEditing={submit}
          error={fieldError(error, 'password')}
        />
        {Boolean(generalError) && (
          <Text role="alert" variant="small" tone="danger">
            {String(generalError)}
          </Text>
        )}
        <Button size="lg" fullWidth loading={submitting} onPress={submit}>
          Entrar
        </Button>
      </View>
      <View className="flex-row flex-wrap justify-center gap-1">
        <Text variant="small" tone="muted">
          Ainda não tem conta?
        </Text>
        <Link href={{ pathname: '/register', params: redirect ? { redirect } : {} }} replace>
          <Text variant="small" weight="medium" tone="primary">
            Criar conta
          </Text>
        </Link>
      </View>
    </AuthScreen>
  );
}
