import React from 'react';
import { Alert, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootParams, openShelf, useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { visibleLists } from '../domain/state';
import { CURATORS, fragranceById } from '../domain/catalog';
import { makeId } from '../domain/models';
import {
  Button,
  Empty,
  FragranceRow,
  Header,
  ListCover,
  Screen,
} from '../ui/components';
import { s } from '../ui/theme';

export function ListScreen() {
  const { params } = useRoute<RouteProp<RootParams, 'List'>>();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const list = visibleLists(state).find(item => item.id === params.id);
  if (!list) {
    return (
      <Screen>
        <Header title="SCENTLIST" onBack={() => nav.goBack()} />
        <Empty
          title="Scentlist tidak tersedia"
          body="Daftar mungkin sudah dihapus atau kuratornya disembunyikan."
        />
      </Screen>
    );
  }
  const mine = list.authorId === state.profile.id;
  const curator = CURATORS.find(item => item.id === list.authorId);
  return (
    <Screen>
      <Header title="SCENTLIST" onBack={() => nav.goBack()} />
      <ListCover list={list} large />
      <View style={{ gap: 9 }}>
        <Text style={s.label}>
          {mine
            ? 'OLEHMU'
            : `OLEH ${curator?.name.toUpperCase()} · KURATOR DEMO`}
        </Text>
        <Text style={s.body}>
          {list.description || 'Sebuah kumpulan aroma, dipilih dengan caramu.'}
        </Text>
        <Text style={s.small}>
          {list.visibility === 'private'
            ? 'Private · hanya untuk profilmu'
            : 'Public dalam demo lokal · belum dibagikan ke internet'}
        </Text>
      </View>
      {mine ? (
        <View style={s.row}>
          <Button
            style={s.flex}
            label="Edit scentlist"
            icon="edit"
            onPress={() => nav.navigate('EditList', { id: list.id })}
          />
          <Button
            label="Hapus"
            variant="danger"
            onPress={() =>
              Alert.alert(
                'Hapus scentlist?',
                `Hapus “${list.title}”? Parfum di My Shelf tetap ada.`,
                [
                  { text: 'Batal', style: 'cancel' },
                  {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                      if (await dispatch({ type: 'deleteList', id: list.id })) {
                        nav.goBack();
                      }
                    },
                  },
                ],
              )
            }
          />
        </View>
      ) : (
        <View style={{ gap: 9 }}>
          <Button
            label={
              state.savedListIds.includes(list.id)
                ? 'Tersimpan · batalkan simpan'
                : 'Simpan scentlist'
            }
            icon="bookmark"
            onPress={() => {
              dispatch({ type: 'bookmark', id: list.id });
            }}
          />
          <Button
            label={
              state.following.includes(list.authorId)
                ? `Mengikuti ${curator?.name} · unfollow`
                : `Ikuti ${curator?.name}`
            }
            variant="secondary"
            onPress={() => {
              dispatch({ type: 'follow', authorId: list.authorId });
            }}
          />
        </View>
      )}
      <View>
        {!mine && state.savedListIds.includes(list.id) && (
          <Button
            label="Lihat scentlists di My Shelf"
            icon="shelf"
            variant="secondary"
            onPress={() => openShelf(nav, { section: 'lists' })}
          />
        )}
        {list.items.length ? (
          list.items.map((item, index) => {
            const fragrance = fragranceById(item.fragranceId);
            return fragrance ? (
              <View key={item.fragranceId}>
                <FragranceRow
                  fragrance={fragrance}
                  subtitle={`0${index + 1} · ${fragrance.concentration}`}
                  onPress={() =>
                    nav.navigate('Fragrance', { id: fragrance.id })
                  }
                />
                {item.note && (
                  <Text
                    style={[s.body, { paddingVertical: 12, paddingLeft: 8 }]}
                  >
                    {item.note}
                  </Text>
                )}
              </View>
            ) : null;
          })
        ) : (
          <Empty
            title="Halaman pertama masih kosong"
            body="Tambahkan beberapa parfum untuk mulai bercerita."
          />
        )}
      </View>
      {!mine && (
        <View style={s.card}>
          <Text style={s.small}>
            Kontrol komunitas demo. Laporan tersimpan lokal dan belum dikirim ke
            moderator.
          </Text>
          <Button
            label="Laporkan daftar contoh"
            variant="ghost"
            onPress={() =>
              Alert.alert(
                'Alasan laporan demo',
                'Pilih alasan untuk mencatat laporan lokal.',
                [
                  { text: 'Batal', style: 'cancel' },
                  ...['Spam', 'Konten tidak sesuai'].map(reason => ({
                    text: reason,
                    onPress: async () => {
                      if (
                        await dispatch({
                          type: 'report',
                          report: {
                            id: makeId('report'),
                            listId: list.id,
                            reason,
                            createdAt: new Date().toISOString(),
                          },
                        })
                      ) {
                        Alert.alert(
                          'Laporan demo dicatat',
                          'Tersimpan di perangkat ini; belum dikirim ke moderator.',
                        );
                      }
                    },
                  })),
                ],
              )
            }
          />
          <Button
            label={`Sembunyikan ${curator?.name}`}
            variant="danger"
            onPress={() =>
              Alert.alert(
                'Sembunyikan kurator?',
                'Daftar kurator ini akan hilang dari Explore, Following, dan Disimpan. Bisa dibatalkan di profil.',
                [
                  { text: 'Batal', style: 'cancel' },
                  {
                    text: 'Sembunyikan',
                    onPress: async () => {
                      if (
                        await dispatch({
                          type: 'block',
                          authorId: list.authorId,
                        })
                      ) {
                        nav.goBack();
                      }
                    },
                  },
                ],
              )
            }
          />
        </View>
      )}
    </Screen>
  );
}
