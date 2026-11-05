import { Link } from 'expo-router';
import { Compass } from '@/lib/icons';
import { View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { Button, EmptyState } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 justify-center bg-white">
      <PageTitle title="Página não encontrada" />
      <EmptyState icon={Compass} title="Página não encontrada" description="Este caminho não leva a lugar nenhum.">
        <Link href="/" asChild replace>
          <Button className="self-center">Voltar para a loja</Button>
        </Link>
      </EmptyState>
    </View>
  );
}
