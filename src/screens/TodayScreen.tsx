import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../storage/AppProvider';
import { useAppNavigation } from '../navigation/types';
import { Accord, localDay, Occasion, OCCASIONS } from '../domain/models';
import { fragranceById } from '../domain/catalog';
import { recommend } from '../domain/recommendations';
import { visibleLists } from '../domain/state';
import {
  Bottle,
  Button,
  Chip,
  Empty,
  FragranceRow,
  Header,
  Icon,
  ListCover,
  Screen,
  Section,
} from '../ui/components';
import { colors, s } from '../ui/theme';

export function TodayScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  const [occasion, setOccasion] = useState<Occasion>('Kuliah');
  const [mood, setMood] = useState<Accord | null>(null);
  const [now, setNow] = useState(new Date());
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, []),
  );
  const owned = state.shelf.filter(item => item.status === 'have');
  const picks = recommend(state, 'owned', occasion, mood, now);
  const discovery = recommend(state, 'discovery', occasion, mood, now).slice(
    0,
    3,
  );
  const current = state.logs.find(
    log => localDay(log.wornAt) === localDay(now),
  );
  const currentFragrance = current && fragranceById(current.fragranceId);
  const hero = picks[0];
  const lists = visibleLists(state).slice(0, 3);
  return (
    <Screen>
      <Header
        title="ESSENZA"
        name={state.profile.name}
        onProfile={() => nav.navigate('Profile')}
      />
      <View style={{ gap: 9 }}>
        <Text style={s.label}>
          {now
            .toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })
            .toUpperCase()}
        </Text>
        <Text style={s.h1}>A little scent.{'\n'}A little you.</Text>
        <Text style={s.body}>
          Hai, {state.profile.name}. Wangi apa yang menemani harimu?
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {OCCASIONS.map(item => (
          <Chip
            key={item}
            label={item}
            selected={occasion === item}
            onPress={() => setOccasion(item)}
          />
        ))}
      </ScrollView>
      <View style={s.wrap}>
        {(['fresh', 'woody', 'sweet'] as Accord[]).map(item => (
          <Chip
            key={item}
            label={`Mood ${item}`}
            selected={mood === item}
            onPress={() => setMood(mood === item ? null : item)}
          />
        ))}
      </View>
      {hero ? (
        <View style={styles.hero}>
          <View style={styles.ring} />
          <View style={styles.heroTop}>
            <View style={{ flex: 1, gap: 12, zIndex: 1 }}>
              <Text style={styles.eyebrow}>TODAY’S SCENT</Text>
              <Text style={styles.heroTitle}>{hero.fragrance.name}</Text>
              <Text style={styles.heroBrand}>
                {hero.fragrance.brand} · {hero.fragrance.concentration}
              </Text>
              <Text style={styles.heroBadge}>DARI KOLEKSIMU</Text>
            </View>
            <Bottle fragrance={hero.fragrance} size={120} />
          </View>
          <Text style={styles.heroReason}>
            {hero.reasons.slice(0, 2).join(' ')}
          </Text>
          <Button
            label="Pakai hari ini"
            icon="drop"
            variant="secondary"
            onPress={() =>
              nav.navigate('Wear', { fragranceId: hero.fragrance.id })
            }
          />
          <Button
            label="Lihat parfumnya"
            variant="ghost"
            style={{ backgroundColor: colors.ivory }}
            onPress={() => nav.navigate('Fragrance', { id: hero.fragrance.id })}
          />
        </View>
      ) : (
        <Empty
          title={
            owned.length
              ? 'Belum ada pilihan yang sesuai'
              : 'Mulai dari koleksimu'
          }
          body={
            owned.length
              ? 'Preferensi aroma yang dihindari menyaring semua pilihan. Kamu bisa meninjau preferensi di profil.'
              : 'Tambahkan parfum yang kamu punya. Kami bantu memilih satu untuk harimu.'
          }
          action={owned.length ? 'Edit preferensi' : 'Jelajahi parfum'}
          onAction={() =>
            owned.length
              ? nav.navigate('Profile')
              : nav.navigate('Home', { screen: 'Discover' })
          }
        />
      )}
      {current && currentFragrance && (
        <View style={s.card}>
          <View style={s.row}>
            <Icon name="check" />
            <Text style={s.label}>NOW WEARING · HARI INI</Text>
          </View>
          <FragranceRow
            fragrance={currentFragrance}
            subtitle={`${current.occasion} · catatan pribadi`}
            onPress={() =>
              nav.navigate('Wear', {
                fragranceId: current.fragranceId,
                logId: current.id,
              })
            }
          />
          <Text style={s.small}>
            {current.note ||
              'Momenmu sudah tersimpan. Tambahkan kesan kapan saja.'}
          </Text>
        </View>
      )}
      {picks.length > 1 && (
        <View>
          <Section title="Pilihan lainnya" />
          {picks.slice(1, 3).map(item => (
            <FragranceRow
              key={item.fragrance.id}
              fragrance={item.fragrance}
              onPress={() =>
                nav.navigate('Fragrance', { id: item.fragrance.id })
              }
            />
          ))}
        </View>
      )}
      <View style={styles.stats}>
        {[
          { value: owned.length, label: 'di koleksi' },
          { value: state.logs.length, label: 'wear logs' },
          { value: state.lists.length, label: 'scentlists' },
        ].map(item => (
          <View
            key={item.label}
            style={{ alignItems: 'center', flex: 1, gap: 3 }}
          >
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={s.small}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 12 }}>
        <Section
          title="A new direction"
          action="Discover"
          onAction={() => nav.navigate('Home', { screen: 'Discover' })}
        />
        <Text style={s.body}>
          Referensi untuk dicoba, dipilih dari preferensimu.
        </Text>
        {discovery.length ? (
          discovery.map(item => (
            <FragranceRow
              key={item.fragrance.id}
              fragrance={item.fragrance}
              onPress={() =>
                nav.navigate('Fragrance', { id: item.fragrance.id })
              }
            />
          ))
        ) : (
          <Text style={s.body}>
            Belum ada kandidat baru dari katalog demo ini.
          </Text>
        )}
      </View>
      <View style={{ gap: 14 }}>
        <Section
          title="Stories in a scentlist"
          action="Lihat"
          onAction={() => nav.navigate('Home', { screen: 'Scentlists' })}
        />
        {lists.map(list => (
          <Pressable
            key={list.id}
            accessibilityRole="button"
            accessibilityLabel={`Buka scentlist ${list.title}`}
            onPress={() => nav.navigate('List', { id: list.id })}
          >
            <ListCover list={list} />
          </Pressable>
        ))}
      </View>
      <Text style={s.small}>
        Demo lokal · metadata dan kurator contoh. Rekomendasi berbasis aturan,
        bukan hasil model ML.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.green,
    borderRadius: 24,
    padding: 22,
    gap: 14,
    overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ring: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderWidth: 1,
    borderColor: '#D4AF3740',
    borderRadius: 130,
    right: -110,
    top: -65,
  },
  eyebrow: {
    fontSize: 10,
    color: '#DCC78B',
    letterSpacing: 2,
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: 'serif',
    fontSize: 32,
    lineHeight: 38,
    color: colors.ivory,
  },
  heroBrand: { color: '#D2DFD5', fontSize: 12, lineHeight: 18 },
  heroBadge: { fontSize: 9, color: '#EED99E', letterSpacing: 1, marginTop: 5 },
  heroReason: { color: '#DDE8DF', fontSize: 13, lineHeight: 21 },
  stats: {
    flexDirection: 'row',
    paddingVertical: 19,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  statValue: { fontFamily: 'serif', fontSize: 26, color: colors.green },
});
