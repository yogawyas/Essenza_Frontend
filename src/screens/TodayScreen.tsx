import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { openShelf, useAppNavigation } from '../navigation/types';
import { Accord, Occasion, OCCASIONS } from '../domain/models';
import { fragranceById } from '../domain/catalog';
import { recommend } from '../domain/recommendations';
import { todayLog, weeklyRecap } from '../domain/today';
import {
  Bottle,
  Button,
  Chip,
  Empty,
  FragranceRow,
  Header,
  Icon,
  Screen,
  Section,
} from '../ui/components';
import { useNow } from '../ui/useNow';
import { colors, s } from '../ui/theme';

export function TodayScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  const [occasion, setOccasion] = useState<Occasion>('Kuliah');
  const [mood, setMood] = useState<Accord | null>(null);
  const [choosing, setChoosing] = useState(false);
  const now = useNow();
  const owned = state.shelf.filter(item => item.status === 'have');
  const picks = recommend(state, 'owned', occasion, mood, now);
  const current = todayLog(state, now);
  const scroll = useRef<ScrollView>(null);
  const previousLog = useRef(current?.id);
  useEffect(() => {
    if (previousLog.current !== current?.id) {
      previousLog.current = current?.id;
      const frame = requestAnimationFrame(() => scroll.current?.scrollTo({ y: 0, animated: false }));
      return () => cancelAnimationFrame(frame);
    }
  }, [current?.id]);
  const currentFragrance = current && fragranceById(current.fragranceId);
  const hero = picks[0];
  const recap = weeklyRecap(state, now);
  const top = recap.top && fragranceById(recap.top);
  const discovery = recommend(state, 'discovery', occasion, mood, now).slice(
    0,
    2,
  );
  return (
    <Screen scrollRef={scroll}>
      <Header
        title="ESSENZA"
        name={state.profile.name}
        onProfile={() => nav.navigate('Profile')}
      />
      <View style={{ gap: 8 }}>
        <Text style={s.label}>
          {now
            .toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })
            .toUpperCase()}
        </Text>
        <Text style={s.h1}>
          {current
            ? 'Your day,' + '\n' + 'beautifully scented.'
            : 'Hari ini,' + '\n' + 'pakai apa?'}
        </Text>
        <Text style={s.body}>
          {current
            ? 'Momenmu sudah tercatat. Bagaimana kesannya?'
            : 'Hai, ' +
              state.profile.name +
              '. Mulai dari wangi yang sudah kamu punya.'}
        </Text>
      </View>
      {current && currentFragrance && (
        <View style={styles.hero} accessibilityLiveRegion="polite">
          <View style={s.row}>
            <Icon name="check" color={colors.gold} />
            <Text style={styles.eyebrow}>NOW WEARING · HARI INI</Text>
          </View>
          <View style={s.row}>
            <View style={s.flex}>
              <Text style={styles.heroTitle}>{currentFragrance.name}</Text>
              <Text style={styles.copy}>
                {current.occasion} · Catatan pribadi
              </Text>
            </View>
            <Bottle fragrance={currentFragrance} size={86} />
          </View>
          <Text style={styles.copy}>
            {current.note ||
              'Tambahkan satu kalimat tentang pengalamanmu. Tidak harus sekarang.'}
          </Text>
          <Button
            label={current.note ? 'Edit kesan' : 'Tambah kesan'}
            icon="edit"
            variant="secondary"
            onPress={() =>
              nav.navigate('Wear', {
                fragranceId: current.fragranceId,
                logId: current.id,
              })
            }
          />
          <Button
            label={choosing ? 'Tutup pilihan lain' : 'Pilih wangi lain'}
            variant="secondary"
            onPress={() => setChoosing(!choosing)}
          />
        </View>
      )}
      {(!current || choosing) && (
        <>
          <View style={s.wrap}>
            {OCCASIONS.map(item => (
              <Chip
                key={item}
                label={item}
                selected={occasion === item}
                onPress={() => setOccasion(item)}
              />
            ))}
          </View>
          <View style={s.wrap}>
            {(['fresh', 'woody', 'sweet'] as Accord[]).map(item => (
              <Chip
                key={item}
                label={'Mood ' + item}
                selected={mood === item}
                onPress={() => setMood(mood === item ? null : item)}
              />
            ))}
          </View>
          {hero ? (
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>PILIHAN DARI KOLEKSIMU</Text>
              <View style={s.row}>
                <View style={s.flex}>
                  <Text style={styles.heroTitle}>{hero.fragrance.name}</Text>
                  <Text style={styles.copy}>{hero.fragrance.brand}</Text>
                </View>
                <Bottle fragrance={hero.fragrance} size={85} />
              </View>
              <Text style={styles.copy}>
                {hero.reasons.slice(0, 2).join(' ')}
              </Text>
              <Button
                label="Pakai hari ini"
                icon="drop"
                variant="secondary"
                onPress={() => {
                  setChoosing(false);
                  nav.navigate('Wear', {
                    fragranceId: hero.fragrance.id,
                    occasion,
                    quick: true,
                  });
                }}
              />
              <Button
                label="Lihat parfumnya"
                variant="secondary"
                onPress={() =>
                  nav.navigate('Fragrance', { id: hero.fragrance.id })
                }
              />
            </View>
          ) : (
            <Empty
              title={
                owned.length
                  ? 'Belum ada pilihan yang sesuai'
                  : 'Satu parfum untuk memulai'
              }
              body={
                owned.length
                  ? 'Semua pilihan tersaring preferensi aroma yang dihindari. Kamu bisa meninjaunya di profil.'
                  : 'Tambahkan parfum ke kategori Punya, bukan Wishlist. Rekomendasi harian akan muncul di sini.'
              }
              action={
                owned.length ? 'Edit preferensi' : 'Tambahkan parfum pertama'
              }
              onAction={() =>
                owned.length
                  ? nav.navigate('Profile')
                  : nav.navigate('Home', { screen: 'Discover' })
              }
            />
          )}
          {picks.length > 1 && (
            <View>
              <Text style={s.h3}>Atau pilih yang ini</Text>
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
        </>
      )}
      <Button
        label={'Buka My Shelf · ' + owned.length + ' parfum punya'}
        icon="shelf"
        variant="secondary"
        onPress={() => openShelf(nav, { section: 'perfumes', status: 'have' })}
      />
      <View style={s.card}>
        <Text style={s.label}>YOUR WEEK IN SCENTS · 7 HARI TERAKHIR</Text>
        {recap.ready && top ? (
          <>
            <Text style={s.h2}>
              {recap.unique} wangi,{'\n'}
              {recap.days} hari bercerita.
            </Text>
            <Text style={s.body}>
              {top.name} termasuk yang paling sering tercatat. Ada {recap.total}{' '}
              catatan dalam periode ini.
            </Text>
          </>
        ) : (
          <>
            <Text style={s.h2}>Pelan-pelan,{'\n'}kenali seleramu.</Text>
            <Text style={s.body}>
              {recap.days} hari tercatat. Ringkasan muncul setelah kamu mencatat
              pemakaian di 3 hari berbeda dalam 7 hari terakhir.
            </Text>
          </>
        )}
        <Button
          label="Buka journal pribadi"
          icon="drop"
          variant="ghost"
          onPress={() => nav.navigate('Journal')}
        />
      </View>
      <View style={s.card}>
        <View style={s.row}>
          <Icon name="studio" />
          <Text style={s.label}>A LITTLE EXPERIMENT</Text>
        </View>
        <Text style={s.h2}>Bagaimana kalau{'\n'}dua wangimu bertemu?</Text>
        <Text style={s.body}>
          Eksplorasi karakter virtual di Studio. Tidak perlu membeli parfum
          baru.
        </Text>
        <Button
          label="Eksplorasi di Studio"
          icon="arrow"
          onPress={() => nav.navigate('Home', { screen: 'Studio' })}
        />
      </View>
      <View style={{ gap: 12 }}>
        <Section
          title="A new direction"
          action="Discover"
          onAction={() => nav.navigate('Home', { screen: 'Discover' })}
        />
        {discovery.map(item => (
          <FragranceRow
            key={item.fragrance.id}
            fragrance={item.fragrance}
            onPress={() => nav.navigate('Fragrance', { id: item.fragrance.id })}
          />
        ))}
        {!discovery.length && (
          <Text style={s.body}>
            Belum ada kandidat baru dari katalog demo ini.
          </Text>
        )}
      </View>
      <Text style={s.small}>
        Demo lokal · rekomendasi berbasis aturan dari koleksi dan catatanmu,
        bukan model ML atau data cuaca.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.green,
    borderRadius: 24,
    padding: 22,
    gap: 16,
  },
  eyebrow: {
    color: colors.lightGold,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: 'serif',
    fontSize: 28,
    lineHeight: 35,
    color: colors.ivory,
  },
  copy: { color: colors.sage, fontSize: 13, lineHeight: 21 },
});
