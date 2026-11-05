import { X } from '@/lib/icons';
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from './IconButton';
import { Text } from './Text';

type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Sheet({ visible, title, onClose, children, footer }: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end md:items-center md:justify-center md:p-6">
        <Pressable aria-label="Fechar" onPress={onClose} className="absolute inset-0 bg-black/40" />
        <View
          role="dialog"
          aria-modal
          aria-label={title}
          className="max-h-[85%] w-full rounded-t-2xl bg-white md:max-w-md md:rounded-2xl"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="flex-row items-center justify-between border-b border-line py-2 pl-5 pr-2">
            <Text variant="h3">{title}</Text>
            <IconButton icon={X} label="Fechar" onPress={onClose} />
          </View>
          <ScrollView contentContainerClassName="p-5" keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer && <View className="border-t border-line p-4">{footer}</View>}
        </View>
      </View>
    </Modal>
  );
}
