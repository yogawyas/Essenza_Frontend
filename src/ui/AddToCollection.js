import React, { useRef, useState } from 'react';
import { Text } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { CollectionRow } from './CollectionRow';
import { Button } from './components';
import { Sheet } from './Sheet';
import { DesignAction, designStyles } from './design';

export function AddToCollection({ fragrance, onClose, onCreate, excludeId }) {
  const { state, dispatch } = useApp();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const lists = state.lists.filter(list => list.id !== excludeId);

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
      type: 'addListPerfume',
      id: list.id,
      fragranceId: fragrance.id,
      updatedAt: new Date().toISOString(),
    });
    pending.current = false;
    setBusy(false);
    if (saved) {
      onClose();
    }
  };

  return (
    <Sheet title="Add to MyShelf" onClose={onClose} busy={busy} compact>
      {lists.map(list => {
        const added = list.items.some(
          item => item.fragranceId === fragrance.id,
        );
        return (
          <CollectionRow
            key={list.id}
            list={list}
            compact
            disabled={added || busy}
            onPress={() => add(list)}
            trailing={
              added ? (
                <Text style={designStyles.caption}>Added</Text>
              ) : (
                <DesignAction
                  name="addDestination"
                  label={'Add to ' + list.title}
                  onPress={() => add(list)}
                  disabled={busy}
                  style={styles.action}
                />
              )
            }
          />
        );
      })}
      {!lists.length ? (
        <>
          <Text style={designStyles.caption}>
            Create a scentlist for this perfume.
          </Text>
          <Button
            label="New Scentlist"
            variant="secondary"
            disabled={busy}
            onPress={onCreate}
          />
        </>
      ) : null}
    </Sheet>
  );
}

const styles = { action: { minHeight: 35 } };
