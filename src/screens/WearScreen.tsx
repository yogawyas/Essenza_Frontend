import React, { useState } from 'react';
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
    original?.occasion || 'Kuliah',
  );
  const [date, setDate] = useState(localDay(original?.wornAt || new Date()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
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
    const parsed = new Date(`${date}T12:00:00`);
    const now = new Date();
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(parsed.getTime()) ||
      localDay(parsed) !== date ||
      date > localDay(now)
    ) {
      setError('Gunakan tanggal valid YYYY-MM-DD, maksimal hari ini.');
      return;
    }
    const wornAt =
      original && localDay(original.wornAt) === date
        ? original.wornAt
        : date === localDay(now)
        ? now.toISOString()
        : parsed.toISOString();
    setError('');
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
  };
  return (
    <Screen>
      <Header title="NOW WEARING" onBack={() => nav.goBack()} />
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Bottle fragrance={fragrance} size={120} />
        <Text style={s.label}>{fragrance.brand.toUpperCase()}</Text>
        <Text style={s.h2}>{fragrance.name}</Text>
      </View>
      <Text style={s.body}>
        Simpan momen kecil hari ini. Catatanmu tetap pribadi.
      </Text>
      <Field
        label="Tanggal pemakaian"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        maxLength={10}
        keyboardType="numbers-and-punctuation"
      />
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
      <Field
        label="Kesanmu (opsional)"
        value={note}
        onChangeText={setNote}
        placeholder="Bagaimana rasanya dipakai hari ini?"
        multiline
        maxLength={280}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
      <Button
        label={original ? 'Simpan perubahan' : 'Simpan pemakaian'}
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
