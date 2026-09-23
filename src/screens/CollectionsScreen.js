import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Modal, Dimensions,
} from 'react-native';
import { C } from '../theme/colors';
import { Header } from '../components/Header';
import { PERFUME_DB, DEFAULT_COLLECTIONS } from '../data/mockData';
import { GoldButton } from '../components/GoldButton';

const { width } = Dimensions.get('window');

const PALETTE = ['#1B6CA8','#2C1654','#D4688A','#8B5E3C','#2E7D52','#B03A2E','#8E44AD','#E67E22'];

const CollectionCard = ({ collection, onPress }) => {
  const previews = collection.perfumeIds
    .slice(0, 3)
    .map(id => PERFUME_DB.find(p => p.id === id))
    .filter(Boolean);

  return (
    <TouchableOpacity style={styles.collectionCard} onPress={onPress} activeOpacity={0.85}>
      {/* Color band */}
      <View style={[styles.cardBand, { backgroundColor: collection.color }]} />
      <View style={styles.cardBody}>
        {/* Mini perfume stack */}
        <View style={styles.previewStack}>
          {previews.map((p, i) => (
            <View
              key={p.id}
              style={[
                styles.previewCircle,
                { backgroundColor: p.color + '33', marginLeft: i > 0 ? -10 : 0, zIndex: 3 - i },
              ]}
            >
              <Text style={styles.previewEmoji}>{p.emoji}</Text>
            </View>
          ))}
          {collection.perfumeIds.length > 3 && (
            <View style={[styles.previewCircle, { backgroundColor: C.divider, marginLeft: -10 }]}>
              <Text style={styles.previewMore}>+{collection.perfumeIds.length - 3}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{collection.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={1}>{collection.desc}</Text>
          <Text style={styles.cardCount}>{collection.perfumeIds.length} fragrances</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const CollectionsScreen = ({ navigation }) => {
  const [collections, setCollections] = useState(DEFAULT_COLLECTIONS);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[0]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newCol = {
      id: `c${Date.now()}`,
      name: newName.trim(),
      desc: newDesc.trim() || 'My scent collection',
      color: newColor,
      perfumeIds: [],
    };
    setCollections(prev => [newCol, ...prev]);
    setNewName('');
    setNewDesc('');
    setNewColor(PALETTE[0]);
    setShowCreate(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Collections" subtitle="Your scent playlists" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Create button */}
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setShowCreate(true)}
          activeOpacity={0.8}
        >
          <View style={styles.createPlus}>
            <View style={styles.plusH} />
            <View style={styles.plusV} />
          </View>
          <View>
            <Text style={styles.createLabel}>New Collection</Text>
            <Text style={styles.createSub}>Group fragrances your way</Text>
          </View>
        </TouchableOpacity>

        {/* Collections grid */}
        <View style={styles.grid}>
          {collections.map(col => (
            <CollectionCard
              key={col.id}
              collection={col}
              onPress={() => navigation.navigate('CollectionDetail', { collection: col })}
            />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Collection</Text>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. My Fresh Morning"
              placeholderTextColor={C.textFaint}
              maxLength={30}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="e.g. Light and energizing picks"
              placeholderTextColor={C.textFaint}
              maxLength={50}
            />

            <Text style={styles.inputLabel}>Color</Text>
            <View style={styles.palette}>
              {PALETTE.map(col => (
                <TouchableOpacity
                  key={col}
                  style={[styles.paletteItem, { backgroundColor: col }, newColor === col && styles.paletteSelected]}
                  onPress={() => setNewColor(col)}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <GoldButton onPress={handleCreate} disabled={!newName.trim()} style={{ flex: 1 }}>
                Create
              </GoldButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const CARD_W = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },
  scrollContent: { paddingBottom: 40 },

  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 24,
    padding: 16,
    backgroundColor: C.cardBg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.goldBorder,
    borderStyle: 'dashed',
    gap: 14,
  },
  createPlus: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: C.greenFaint,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  plusH: { position: 'absolute', width: 18, height: 2, backgroundColor: C.green, borderRadius: 1 },
  plusV: { position: 'absolute', width: 2, height: 18, backgroundColor: C.green, borderRadius: 1 },
  createLabel: { color: C.greenDark, fontSize: 15, fontWeight: '700' },
  createSub: { color: C.textMuted, fontSize: 12, marginTop: 2 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 24, gap: 12,
  },
  collectionCard: {
    width: CARD_W,
    backgroundColor: C.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1, borderColor: C.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBand: { height: 6 },
  cardBody: { padding: 14 },
  previewStack: { flexDirection: 'row', marginBottom: 12 },
  previewCircle: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: C.cardBg,
  },
  previewEmoji: { fontSize: 16 },
  previewMore: { color: C.textMuted, fontSize: 10, fontWeight: '700' },
  cardInfo: {},
  cardName: { color: C.greenDark, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  cardDesc: { color: C.textMuted, fontSize: 11, marginBottom: 6 },
  cardCount: { color: C.textFaint, fontSize: 10, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingTop: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.divider, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { color: C.greenDark, fontSize: 20, fontWeight: '800', marginBottom: 20 },
  inputLabel: { color: C.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    backgroundColor: C.offWhite,
    borderRadius: 12, padding: 14,
    color: C.greenDark, fontSize: 15,
    marginBottom: 16,
    borderWidth: 1, borderColor: C.divider,
  },
  palette: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  paletteItem: { width: 30, height: 30, borderRadius: 15 },
  paletteSelected: { borderWidth: 3, borderColor: C.gold },
  modalActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  cancelBtn: {
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 30, borderWidth: 1, borderColor: C.divider,
  },
  cancelText: { color: C.textMuted, fontSize: 15, fontWeight: '600' },
});
