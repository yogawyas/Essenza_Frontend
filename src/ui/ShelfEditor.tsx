import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  BottleFormat,
  Fragrance,
  ShelfItem,
  ShelfStatus,
} from '../domain/models';
import { useApp } from '../storage/AppProvider';
import { Button, Chip, Icon } from './components';
import { Sheet } from './Sheet';
import { s } from './theme';

export const SHELF_LABELS: Record<ShelfStatus | 'favorites', string> = {
  have: 'Punya',
  want: 'Wishlist',
  had: 'Pernah punya',
  favorites: 'Favorit',
};
export function ShelfEditor({
  fragrance,
  item,
  onClose,
  onView,
}: {
  fragrance: Fragrance;
  item?: ShelfItem;
  onClose: () => void;
  onView: (status: ShelfStatus) => void;
}) {
  const { dispatch } = useApp();
  const [status, setStatus] = useState<ShelfStatus | null>(
    item?.status || null,
  );
  const [format, setFormat] = useState<BottleFormat>(
    item?.format || 'Full bottle',
  );
  const [saved, setSaved] = useState<ShelfStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const save = async () => {
    if (!status || locked.current) {
      return;
    }
    locked.current = true;
    setBusy(true);
    const success = await dispatch({
      type: 'shelf',
      item: { fragranceId: fragrance.id, status, format },
    });
    if (success) {
      setSaved(status);
    }
    setBusy(false);
    locked.current = false;
  };
  return (
    <Sheet
      title={saved ? 'Tersimpan di My Shelf' : 'Tambahkan ke koleksimu'}
      onClose={onClose}
      busy={busy}
    >
      {saved ? (
        <>
          <View style={s.row}>
            <Icon name="check" />
            <Text style={[s.h3, s.flex]}>{fragrance.name}</Text>
          </View>
          <Text style={s.body} accessibilityLiveRegion="polite">
            Tersimpan di My Shelf · {SHELF_LABELS[saved]}. Kamu bisa
            mengelolanya di sana.
          </Text>
          <Button
            label="Lihat My Shelf"
            icon="shelf"
            onPress={() => onView(saved)}
          />
          <Button label="Lanjut eksplorasi" variant="ghost" onPress={onClose} />
        </>
      ) : (
        <>
          <Text style={s.h2}>{fragrance.name}</Text>
          <Text style={s.body}>
            Pilih tempatnya. Favorit adalah penanda suka, terpisah dari
            kepemilikan.
          </Text>
          <View style={s.wrap}>
            {(['have', 'want', 'had'] as ShelfStatus[]).map(value => (
              <Chip
                key={value}
                label={SHELF_LABELS[value]}
                selected={status === value}
                onPress={() => setStatus(value)}
              />
            ))}
          </View>
          {status && (
            <>
              <Text style={s.label}>
                {status === 'want' ? 'FORMAT YANG DIINGINKAN' : 'FORMAT'}
              </Text>
              <View style={s.wrap}>
                {(['Full bottle', 'Decant', 'Sample'] as BottleFormat[]).map(
                  value => (
                    <Chip
                      key={value}
                      label={value}
                      selected={format === value}
                      onPress={() => setFormat(value)}
                    />
                  ),
                )}
              </View>
            </>
          )}
          <Button
            label={item ? 'Simpan perubahan' : 'Simpan ke My Shelf'}
            disabled={!status}
            loading={busy}
            onPress={save}
          />
        </>
      )}
    </Sheet>
  );
}
