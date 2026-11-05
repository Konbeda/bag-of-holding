import { Search } from '@/lib/icons';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { colors } from '@/theme';

type SearchFieldProps = {
  initialValue?: string;
  onSubmit: (term: string) => void;
};

export function SearchField({ initialValue = '', onSubmit }: SearchFieldProps) {
  const [term, setTerm] = useState(initialValue);

  return (
    <View className="min-h-11 flex-1 flex-row items-center gap-2 rounded-md border border-line bg-surface px-3">
      <Search size={18} color={colors.ink.muted} />
      <TextInput
        aria-label="Buscar produtos"
        placeholder="Buscar dados, livros, miniaturas..."
        placeholderTextColor={colors.ink.muted}
        value={term}
        onChangeText={setTerm}
        onSubmitEditing={() => onSubmit(term.trim())}
        returnKeyType="search"
        className="flex-1 py-2.5 font-sans text-sm leading-5 text-ink web:outline-none"
      />
    </View>
  );
}
