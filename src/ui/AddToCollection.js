import React, { useRef, useState } from 'react';
import { Text } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { CollectionRow } from './CollectionRow';
import { Button, IconButton } from './components';
import { Sheet } from './Sheet';
import { designStyles } from './design';

export function AddToCollection({ fragrance, onClose, onCreate }) {
  const { state, dispatch } = useApp();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const add = async list => {
    if (
      pending.current ||
      list.items.some(item => item.fragranceId === fragrance.id)
    ) {
      return;
    }
    pending.current = true;
    setBusy(true);
    const saved = await dispatch({
      type: 'saveList',
      list: {
        ...list,
        updatedAt: new Date().toISOString(),
        items: [...list.items, { fragranceId: fragrance.id, note: '' }],
      },
    });
    pending.current = false;
    setBusy(false);
    if (saved) {
      onClose();
    }
  };
  return (
    <Sheet title="Add to MyShelf" onClose={onClose} busy={busy} compact>
      {state.lists.map(list => {
        const added = list.items.some(
          item => item.fragranceId === fragrance.id,
        );
        return (
          <CollectionRow
            key={list.id}
            list={list}
            onPress={() => add(list)}
            trailing={
              added ? (
                <Text style={designStyles.caption}>Added</Text>
              ) : (
                <IconButton
                  name="plus"
                  label={'Add to ' + list.title}
                  onPress={() => add(list)}
                />
              )
            }
          />
        );
      })}
      {!state.lists.length ? (
        <Text style={designStyles.caption}>
          Create a scentlist for this perfume.
        </Text>
      ) : null}
      <Button
        label="New Scentlist"
        variant="secondary"
        disabled={busy}
        onPress={onCreate}
      />
    </Sheet>
  );
}
