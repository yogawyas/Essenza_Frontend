import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { Button, Chip, Icon } from './components';
import { Sheet } from './Sheet';
import { s } from './theme';
export const SHELF_LABELS = {
  have: 'Owned',
  want: 'Wishlist',
  had: 'Previously owned',
  favorites: 'Favorites',
};
export function ShelfEditor({
  fragrance,
  item,
  onClose,
  onView,
  finishLabel = 'View MyShelf',
}) {
  const { dispatch } = useApp();
  const [status, setStatus] = useState(item?.status || null);
  const [format, setFormat] = useState(item?.format || 'Full bottle');
  const [saved, setSaved] = useState(null);
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
      item: {
        fragranceId: fragrance.id,
        status,
        format,
      },
    });
    if (success) {
      setSaved(status);
    }
    setBusy(false);
    locked.current = false;
  };
  return (
    <Sheet
      title={saved ? 'Saved to My Shelf' : 'Add to your collection'}
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
            Saved to My Shelf · {SHELF_LABELS[saved]}
          </Text>
          <Button
            label={finishLabel}
            icon="shelf"
            onPress={() => onView(saved)}
          />
          <Button label="Keep exploring" variant="ghost" onPress={onClose} />
        </>
      ) : (
        <>
          <Text style={s.h2}>{fragrance.name}</Text>
          <Text style={s.body}>
            Choose a shelf category for this fragrance.
          </Text>
          <View style={s.wrap}>
            {['have', 'want', 'had'].map(value => (
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
                {status === 'want' ? 'DESIRED FORMAT' : 'FORMAT'}
              </Text>
              <View style={s.wrap}>
                {['Full bottle', 'Decant', 'Sample'].map(value => (
                  <Chip
                    key={value}
                    label={value}
                    selected={format === value}
                    onPress={() => setFormat(value)}
                  />
                ))}
              </View>
            </>
          )}
          <Button
            label={item ? 'Save changes' : 'Save to My Shelf'}
            disabled={!status}
            loading={busy}
            onPress={save}
          />
        </>
      )}
    </Sheet>
  );
}
