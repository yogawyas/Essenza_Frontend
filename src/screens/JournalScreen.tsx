import React from 'react';
import { Text, View } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { useAppNavigation } from '../navigation/types';
import { fragranceById } from '../domain/catalog';
import { Button, Empty, FragranceRow, Header, Screen } from '../ui/components';
import { s } from '../ui/theme';

export function JournalScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  return (
    <Screen>
      <Header title="SCENT JOURNAL" onBack={() => nav.goBack()} />
      <Text style={s.h1}>Scents become{'\n'}memories.</Text>
      <Text style={s.body}>
        Catatan pribadi tentang apa yang kamu pakai dan rasakan.
      </Text>
      {state.logs.length ? (
        state.logs.map(log => {
          const fragrance = fragranceById(log.fragranceId);
          return fragrance ? (
            <View key={log.id} style={s.card}>
              <Text style={s.label}>
                {new Date(log.wornAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <FragranceRow
                fragrance={fragrance}
                subtitle={`${log.occasion} · pribadi`}
                onPress={() =>
                  nav.navigate('Wear', {
                    fragranceId: log.fragranceId,
                    logId: log.id,
                  })
                }
              />
              <Text style={s.body}>
                {log.note || 'Belum ada catatan tambahan.'}
              </Text>
              <Button
                label="Edit catatan"
                variant="ghost"
                onPress={() =>
                  nav.navigate('Wear', {
                    fragranceId: log.fragranceId,
                    logId: log.id,
                  })
                }
              />
            </View>
          ) : null;
        })
      ) : (
        <Empty
          title="Satu aroma, satu cerita"
          body="Pilih parfum dari Today atau Discover, lalu ketuk Catat pemakaian."
          action="Jelajahi parfum"
          onAction={() => nav.navigate('Home', { screen: 'Discover' })}
        />
      )}
    </Screen>
  );
}
