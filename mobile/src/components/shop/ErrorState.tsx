import { CloudOff } from 'lucide-react-native';

import { Button, EmptyState } from '@/components/ui';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={CloudOff}
      title="Não foi possível carregar"
      description="Verifique a sua conexão e tente novamente."
    >
      <Button variant="secondary" size="sm" className="self-center" onPress={onRetry}>
        Tentar novamente
      </Button>
    </EmptyState>
  );
}
