import React, { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootParams, useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { fragranceById } from '../domain/catalog';
import { localDay, makeId, Occasion, OCCASIONS } from '../domain/models';
import {
  Bottle,
  Button,
  Chip,
  Empty,
  Field,
  Header,
  Screen,
} from '../ui/components';
import { s } from '../ui/theme';

export function WearScreen() {
  const { params } = useRoute<RouteProp<RootParams, 'Wear'>>();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const original = state.logs.find(log => log.id === params.logId);
  const fragrance = fragranceById(params.fragranceId);
  const [id] = useState(original?.id || makeId('wear'));
  const [note, setNote] = useState(original?.note || '');
  const [occasion, setOccasion] = useState<Occasion>(
    original?.occasion || params.occasion || 'Kuliah',
  );
  const [date, setDate] = useState(localDay(original?.wornAt || new Date()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(!params.quick || !!original);
  const locked = useRef(false);
  if (!fragrance) {
    return (
      <Screen>
        <Empty
          title="Parfum tidak ditemukan"
          body="Kembali dan pilih parfum lain."
        />
      </Screen>
    );
  }
  const save = async () => {
    if (locked.current) {
      return;
    }
    const now = new Date();
    const selectedDate = params.quick && !expanded ? localDay(now) : date;
    const parsed = new Date(`${selectedDate}T12:00:00`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ||
      !Number.isFinite(parsed.getTime()) ||
      localDay(parsed) !== selectedDate ||
      selectedDate > localDay(now)
    ) {
      setError('Gunakan tanggal valid YYYY-MM-DD, maksimal hari ini.');
      return;
    }
    const wornAt =
      original && localDay(original.wornAt) === selectedDate
        ? original.wornAt
        : selectedDate === localDay(now)
        ? now.toISOString()
        : parsed.toISOString();
    setError('');
    locked.current = true;
    setBusy(true);
    if (
      await dispatch({
        type: 'wear',
        log: { id, fragranceId: fragrance.id, wornAt, occasion, note },
      })
    ) {
      nav.goBack();
    }
    setBusy(false);
    locked.current = false;
  };
  return (
    <Screen>
      <Header title="NOW WEARING" onBack={() => nav.goBack()} />
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Bottle fragrance={fragrance} size={expanded ? 95 : 65} />
        <Text style={s.label}>{fragrance.brand.toUpperCase()}</Text>
        <Text style={s.h2}>{fragrance.name}</Text>
      </View>
      <Text style={s.body}>
        Simpan momen kecil hari ini. Catatanmu tetap pribadi.
      </Text>
      {!expanded && <Text style={s.h3}>Hari ini · {occasion}</Text>}
      {expanded && (
        <Field
          label="Tanggal pemakaian"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />
      )}
      <Text style={s.label}>AKTIVITAS</Text>
      <View style={s.wrap}>
        {OCCASIONS.map(item => (
          <Chip
            label={item}
            key={item}
            selected={occasion === item}
            onPress={() => setOccasion(item)}
          />
        ))}
      </View>
      {expanded && (
        <Field
          label="Kesanmu (opsional)"
          value={note}
          onChangeText={setNote}
          placeholder="Bagaimana rasanya dipakai hari ini?"
          multiline
          maxLength={280}
        />
      )}
      {!expanded && (
        <Button
          label="Tambahkan kesan atau ubah tanggal"
          variant="ghost"
          onPress={() => setExpanded(true)}
        />
      )}
      {!!error && <Text style={s.error}>{error}</Text>}
      <Button
        label={
          original
            ? 'Simpan perubahan'
            : params.quick && !expanded
            ? 'Konfirmasi pemakaian hari ini'
            : 'Simpan pemakaian'
        }
        icon="check"
        loading={busy}
        onPress={save}
      />
      {original && (
        <Button
          label="Hapus catatan"
          variant="danger"
          onPress={() =>
            Alert.alert(
              'Hapus catatan ini?',
              'Catatan akan dihapus dari journal dan riwayat rekomendasi.',
              [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Hapus',
                  style: 'destructive',
                  onPress: async () => {
                    if (
                      await dispatch({ type: 'deleteWear', id: original.id })
                    ) {
                      nav.goBack();
                    }
                  },
                },
              ],
            )
          }
        />
      )}
    </Screen>
  );
}
