import React, { useRef, useState } from 'react';
import { useApp } from '../storage/AppProvider';
import { OptionSheet } from './OptionSheet';

export function ScentlistMenu({ list, onClose, onEdit, onDelete }) {
  const { dispatch } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const commit = async action => {
    if (pending.current) {
      return;
    }
    pending.current = true;
    setBusy(true);
    const saved = await dispatch(action);
    pending.current = false;
    setBusy(false);
    if (saved) {
      onClose();
      if (action.type === 'deleteList') {
        onDelete?.();
      }
    }
  };
  const isPrivate = list.visibility === 'private';
  const privacyLabel = isPrivate ? 'Make Public' : 'Make Private';
  const remove = () => commit({ type: 'deleteList', id: list.id });
  return (
    <OptionSheet
      title={confirm ? 'Delete this scentlist?' : undefined}
      onClose={onClose}
      busy={busy}
      busyLabel={confirm ? 'Delete Scentlist' : privacyLabel}
      rows={
        confirm
          ? [
              { label: 'Cancel', onPress: () => setConfirm(false) },
              {
                label: 'Delete Scentlist',
                icon: 'listDelete',
                onPress: remove,
              },
            ]
          : [
              {
                label: 'Edit Scentlist',
                icon: 'listEdit',
                onPress: () => {
                  onClose();
                  onEdit();
                },
              },
              {
                label: privacyLabel,
                icon: 'listLock',
                onPress: () =>
                  commit({
                    type: 'updateList',
                    id: list.id,
                    changes: { visibility: isPrivate ? 'public' : 'private' },
                    updatedAt: new Date().toISOString(),
                  }),
              },
              {
                label: 'Delete Scentlist',
                icon: 'listDelete',
                onPress: () => setConfirm(true),
              },
            ]
      }
    />
  );
}
