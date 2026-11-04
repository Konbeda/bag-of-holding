import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-white px-4">
      <Text className="text-3xl font-semibold text-ink">Bag of Holding</Text>
      <Text className="text-base text-ink-muted">Tudo para a sua próxima aventura.</Text>
      <View className="mt-4 rounded-md bg-primary px-4 py-2">
        <Text className="text-sm font-medium text-white">Em construção</Text>
      </View>
    </View>
  );
}
