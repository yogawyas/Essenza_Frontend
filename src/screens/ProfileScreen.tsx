import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { useAppNavigation } from '../navigation/types';
import { ACCORDS, Accord } from '../domain/models';
import { CURATORS } from '../domain/catalog';
import { Button, Chip, Field, Header, Icon, Screen } from '../ui/components';
import { colors, s } from '../ui/theme';

export function ProfileScreen({
  onboarding = false,
}: {
  onboarding?: boolean;
}) {
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const [name, setName] = useState(state.profile.name);
  const [bio, setBio] = useState(state.profile.bio);
  const [likes, setLikes] = useState(state.profile.likes);
  const [avoids, setAvoids] = useState(state.profile.avoids);
  const [busy, setBusy] = useState(false);
  const toggle = (accord: Accord, kind: 'likes' | 'avoids') => {
    if (kind === 'likes') {
      setLikes(values =>
        values.includes(accord)
          ? values.filter(value => value !== accord)
          : [...values, accord],
      );
      setAvoids(values => values.filter(value => value !== accord));
    } else {
      setAvoids(values =>
        values.includes(accord)
          ? values.filter(value => value !== accord)
          : [...values, accord],
      );
      setLikes(values => values.filter(value => value !== accord));
    }
  };
  const save = async (guest = false) => {
    setBusy(true);
    const result = await dispatch({
      type: 'profile',
      profile: {
        ...state.profile,
        name: guest ? 'Penjelajah' : name,
        bio,
        likes,
        avoids,
      },
      onboard: true,
    });
    if (result && !onboarding) {
      Alert.alert(
        'Profil tersimpan',
        'Preferensi baru sudah digunakan untuk pilihan parfum.',
      );
    }
    setBusy(false);
  };
  return (
    <Screen>
      <Header
        title="ESSENZA"
        onBack={onboarding ? undefined : () => nav.goBack()}
      />
      {onboarding && (
        <View
          style={{
            backgroundColor: colors.green,
            borderRadius: 24,
            padding: 25,
            gap: 20,
          }}
        >
          <Icon name="drop" size={42} color={colors.gold} />
          <Text style={[s.h1, { color: colors.ivory }]}>
            Your scent.{'\n'}Your story.
          </Text>
          <Text style={[s.body, { color: '#D3E0D4' }]}>
            Kumpulkan aroma favorit. Rangkai cerita dalam scentlist. Temukan
            pilihan untuk harimu.
          </Text>
        </View>
      )}
      <Text style={onboarding ? s.h2 : s.h1}>
        {onboarding ? 'Mulai dengan seleramu.' : 'Made of little details.'}
      </Text>
      <View style={[s.card, { backgroundColor: colors.lightGold }]}>
        <Text style={s.label}>MODE DEMO LOKAL</Text>
        <Text style={s.body}>
          Profil dan aktivitas tersimpan di HP ini. Belum ada login cloud,
          sinkronisasi, atau publikasi ke pengguna lain.
        </Text>
      </View>
      <Field
        label="Nama panggilan"
        value={name}
        onChangeText={setName}
        placeholder="Kamu ingin dipanggil apa?"
        maxLength={40}
      />
      {!onboarding && (
        <Field
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Ceritakan selera wangimu"
          multiline
          maxLength={160}
        />
      )}
      <Text style={s.h3}>Aroma yang kamu sukai</Text>
      <Text style={s.small}>Pilih beberapa, atau lewati kalau belum tahu.</Text>
      <View style={s.wrap}>
        {ACCORDS.map(accord => (
          <Chip
            key={accord}
            label={accord}
            selected={likes.includes(accord)}
            onPress={() => toggle(accord, 'likes')}
          />
        ))}
      </View>
      <Text style={s.h3}>Lebih suka menghindari?</Text>
      <View style={s.wrap}>
        {ACCORDS.map(accord => (
          <Chip
            key={accord}
            label={accord}
            selected={avoids.includes(accord)}
            onPress={() => toggle(accord, 'avoids')}
          />
        ))}
      </View>
      <Button
        label={onboarding ? 'Mulai demo' : 'Simpan profil'}
        disabled={!name.trim()}
        loading={busy}
        onPress={() => save()}
      />
      {onboarding && (
        <Button
          label="Jelajahi dulu"
          variant="ghost"
          loading={busy}
          onPress={() => save(true)}
        />
      )}
      {!onboarding && (
        <>
          <View style={s.card}>
            <Text style={s.h3}>Privasi dan kontrol demo</Text>
            <Text style={s.body}>
              Wear log selalu pribadi. Public pada scentlist hanya
              mensimulasikan Explore di perangkat ini.
            </Text>
            <Text style={s.small}>
              {state.reports.length} laporan demo tercatat lokal.
            </Text>
            {state.blocked.map(id => (
              <Button
                key={id}
                label={`Tampilkan kembali ${
                  CURATORS.find(c => c.id === id)?.name || id
                }`}
                variant="secondary"
                onPress={() => {
                  dispatch({ type: 'block', authorId: id });
                }}
              />
            ))}
          </View>
          <Button
            label="Hapus profil dan semua data lokal"
            variant="danger"
            onPress={() =>
              Alert.alert(
                'Hapus semua data demo?',
                'Profil, shelf, favorit, scentlists, journal, dan pengaturan demo pada HP ini akan dihapus. Tindakan ini tidak bisa dibatalkan.',
                [
                  { text: 'Batal', style: 'cancel' },
                  {
                    text: 'Hapus data lokal',
                    style: 'destructive',
                    onPress: () => {
                      dispatch({ type: 'reset' });
                    },
                  },
                ],
              )
            }
          />
        </>
      )}
      <Text style={s.small}>
        Essenza / B2C preview · profil preferensi, bukan diagnosis atau prediksi
        kimia.
      </Text>
    </Screen>
  );
}
