import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COMPOUNDS, CompoundPicker } from '../components/CompoundPicker';
import { inputError } from '../domain/analysis';
import { v7PredictionService } from '../services/v7Prediction';
import { useFavorites } from '../storage/FavoritesProvider';
import { useLab } from '../storage/LabProvider';
import { useTutorial } from '../tutorial/TutorialProvider';
import { Button, Notice, Page, SectionTitle } from '../ui/components';
import { Icon, MoleculeMark } from '../ui/Icon';
import { colors, mono, s, sans } from '../ui/theme';
export function AnalysisScreen({ service = v7PredictionService }) {
  const navigation = useNavigation();
  const favorites = useFavorites();
  const lab = useLab();
  const { visible: tutorialVisible, step: tutorialStep, registerAnchor } = useTutorial();
  const scrollRef = useRef(null);
  const catalogRef = useRef(null);
  const translatorRef = useRef(null);
  const predictRef = useRef(null);
  const [inputMode, setInputMode] = useState('catalog');
  const [selectedCompound, setSelectedCompound] = useState(null);
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [resolvedCompound, setResolvedCompound] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [smiles, setSmiles] = useState('');
  const [sampleName, setSampleName] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const inFlight = useRef(false);
  const requestVersion = useRef(0);
  const controller = useRef(null);
  const lookupVersion = useRef(0);
  const lookupController = useRef(null);
  useEffect(() => {
    registerAnchor('catalog', catalogRef);
    registerAnchor('translator', translatorRef);
    registerAnchor('predict', predictRef);
  }, [registerAnchor]);
  useEffect(() => {
    if (tutorialVisible && tutorialStep < 3) {
      const timer = setTimeout(() => scrollRef.current?.scrollTo({ y: 300, animated: true }), 160);
      return () => clearTimeout(timer);
    }
  }, [tutorialVisible, tutorialStep]);
  useFocusEffect(
    useCallback(() => {
      return () => {
        controller.current?.abort();
        controller.current = null;
        lookupController.current?.abort();
        lookupController.current = null;
        lookupVersion.current += 1;
        requestVersion.current += 1;
        inFlight.current = false;
        setBusy(false);
        setResolving(false);
        setProgress(null);
      };
    }, []),
  );
  const changeQuery = text => {
    lookupController.current?.abort();
    lookupVersion.current += 1;
    setResolving(false);
    setQuery(text);
    setCandidates([]);
    setResolvedCompound(null);
    setError(null);
  };
  const resolveQuery = async () => {
    const text = query.trim();
    if (!text) {
      setError('Masukkan nama atau rumus senyawa dulu.');
      return;
    }
    Keyboard.dismiss();
    lookupController.current?.abort();
    const version = ++lookupVersion.current;
    const active = new AbortController();
    lookupController.current = active;
    setResolving(true);
    setCandidates([]);
    setResolvedCompound(null);
    setError(null);
    try {
      const matches = await service.resolve({ query: text, signal: active.signal });
      if (version === lookupVersion.current) { setCandidates(matches); }
    } catch (cause) {
      if (version === lookupVersion.current) {
        setError(cause instanceof Error ? cause.message : 'Pencarian belum berhasil. Coba lagi.');
      }
    } finally {
      if (version === lookupVersion.current) {
        lookupController.current = null;
        setResolving(false);
      }
    }
  };
  const analyze = async () => {
    if (inFlight.current) {
      return;
    }
    const activeCompound = inputMode === 'catalog' ? selectedCompound : resolvedCompound;
    const problem = inputMode === 'smiles' ? inputError(smiles)
      : inputMode === 'translator'
        ? !resolvedCompound ? 'Cari lalu pilih satu struktur senyawa dulu.'
          : !resolvedCompound.prediction_supported ? 'Senyawa ini bukan bahan aroma dalam cakupan model. Coba senyawa organik lain.' : null
        : selectedCompound ? null : 'Pilih senyawa dari katalog dulu.';
    setError(problem);
    if (problem) {
      return;
    }
    Keyboard.dismiss();
    inFlight.current = true;
    const version = ++requestVersion.current;
    controller.current = new AbortController();
    setBusy(true);
    setProgress(null);
    try {
      const result = await service.predict({
        smiles: inputMode === 'smiles' ? smiles : activeCompound.smiles,
        catalogName: inputMode === 'smiles' ? '' : activeCompound.name,
        sampleName: sampleName || (inputMode === 'smiles' ? '' : activeCompound.name),
        signal: controller.current.signal,
        onProgress: () => {
          if (version === requestVersion.current) {
            setProgress('Menganalisis aroma…');
          }
        },
      });
      if (version === requestVersion.current) {
        let saveError = null;
        try {
          await lab.save(result);
        } catch (cause) {
          saveError = cause?.message || 'Hasil belum tersimpan ke Riwayat.';
        }
        if (version === requestVersion.current) {
          navigation.navigate('Result', { result, saveError });
        }
      }
    } catch (cause) {
      if (version === requestVersion.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Analisis belum dapat diproses. Silakan coba lagi.',
        );
      }
    } finally {
      if (version === requestVersion.current) {
        controller.current = null;
        inFlight.current = false;
        setBusy(false);
        setProgress(null);
      }
    }
  };
  const saveSelected = async () => {
    const activeCompound = inputMode === 'catalog' ? selectedCompound : resolvedCompound;
    if (!activeCompound) { return; }
    try {
      await favorites.create({
        smiles: activeCompound.smiles,
        name: activeCompound.name,
      });
      setError(null);
    } catch (cause) {
      setError(cause?.message || 'Senyawa belum tersimpan.');
    }
  };
  const activeCompound = inputMode === 'catalog' ? selectedCompound : resolvedCompound;
  const selectedSaved = activeCompound && favorites.items.some(item =>
    item.smiles === activeCompound.smiles);
  return (
    <Page scrollRef={scrollRef}>
      <View style={styles.hero}>
        <View style={styles.heroEyebrowRow}>
          <View style={styles.heroAccent} />
          <Text style={styles.heroEyebrow}>RUANG KERJA LABORATORIUM</Text>
        </View>
        <View style={styles.heroContent}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              Satu molekul.{'\n'}Beragam aroma.
            </Text>
            <Text style={styles.heroBody}>
              Eksplorasi profil aroma molekul dalam satu ruang analisis.
            </Text>
          </View>
          <MoleculeMark size={116} />
        </View>
      </View>

      <View style={s.stack}>
        <SectionTitle number="01" title="Analisis molekul" />
        <View style={s.card}>
          <View style={s.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pilih dari katalog"
              onPress={() => { setInputMode('catalog'); setError(null); }}
              style={[styles.mode, inputMode === 'catalog' && styles.selected]}
            >
              <Text style={s.label}>Pilih senyawa</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cari nama atau rumus"
              ref={translatorRef}
              onPress={() => { setInputMode('translator'); setError(null); }}
              style={[styles.mode, inputMode === 'translator' && styles.selected]}
            >
              <Text style={s.label}>Nama / rumus</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Input SMILES lanjutan"
            onPress={() => { setInputMode('smiles'); setError(null); }}
            style={styles.advancedLink}
          >
            <Text style={styles.advancedText}>Punya kode SMILES? Buka input lanjutan →</Text>
          </Pressable>
          {inputMode === 'catalog' ? <View style={styles.fieldGroup}>
            <Text style={s.label}>Senyawa yang ingin dianalisis</Text>
            <CompoundPicker
              targetRef={catalogRef}
              selected={selectedCompound}
              onSelect={item => {
                setSelectedCompound(item);
                setSampleName('');
                setError(null);
              }}
              disabled={busy}
            />
            <Text style={s.small}>
              Pilih dari {COMPOUNDS.length.toLocaleString('id-ID')} senyawa yang tersedia.
              Kolom pencarian di dalam daftar hanya menyaring pilihan.
            </Text>
          </View> : inputMode === 'translator' ? <View style={styles.fieldGroup}>
            <Text style={s.label}>Nama umum atau rumus kimia</Text>
            <TextInput
              accessibilityLabel="Nama atau rumus senyawa"
              value={query}
              onChangeText={changeQuery}
              editable={!busy}
              maxLength={200}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Contoh: vanillin, ethanol, C2H6O"
              placeholderTextColor={colors.muted}
              style={s.field}
              onSubmitEditing={resolveQuery}
            />
            <Text style={s.small}>
              Nama dicari di katalog dulu, lalu di basis data kimia. Rumus bisa cocok dengan beberapa struktur.
            </Text>
            <Button label={resolving ? 'Mencari senyawa…' : 'Cari struktur'}
              secondary loading={resolving} disabled={busy || resolving} onPress={resolveQuery} />
            {candidates.length > 0 && <View style={styles.fieldGroup}>
              <Text style={s.label}>Pilih struktur yang sesuai ({candidates.length})</Text>
              {candidates.map((item, index) => <Pressable
                key={`${item.smiles}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Pilih struktur ${item.name}, ${item.molecular_formula}`}
                accessibilityState={{ selected: resolvedCompound?.smiles === item.smiles }}
                disabled={busy}
                onPress={() => { setResolvedCompound(item); setSampleName(''); setError(null); }}
                style={[styles.candidate, resolvedCompound?.smiles === item.smiles && styles.selected]}
              >
                <View style={s.grow}>
                  <Text style={s.label}>{item.name}</Text>
                  <Text style={s.small}>{item.molecular_formula}{item.cid ? ` · CID ${item.cid}` : ''}</Text>
                  <Text style={styles.structureCode} numberOfLines={2}>{item.smiles}</Text>
                </View>
                <Icon name={resolvedCompound?.smiles === item.smiles ? 'check' : 'chevron'} size={18} />
              </Pressable>)}
            </View>}
            {resolvedCompound && !resolvedCompound.prediction_supported && <Notice>
              Struktur ditemukan, tetapi senyawa ini di luar cakupan prediksi aroma bahan parfum.
            </Notice>}
            {resolvedCompound?.prediction_supported && !resolvedCompound.in_catalog && <Notice>
              Senyawa ini tidak ada di katalog model. Hasilnya perlu dicek langsung karena tingkat kepastiannya belum teruji.
            </Notice>}
          </View> : <View style={styles.fieldGroup}>
            <View style={s.between}>
              <Text style={s.label}>Struktur molekul</Text>
              <Text style={s.eyebrow}>MODE LANJUTAN</Text>
            </View>
            <TextInput
              accessibilityLabel="SMILES molekul"
              value={smiles}
              onChangeText={text => {
                setSmiles(text);
                setError(null);
              }}
              editable={!busy}
              maxLength={2000}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              placeholder="Masukkan SMILES satu molekul…"
              placeholderTextColor={colors.muted}
              style={[s.field, styles.smiles]}
            />
            <Text style={s.small}>
              Gunakan ini jika struktur bahan sudah diketahui. Sistem akan
              memeriksa satu molekul sebelum menampilkan profil aromanya.
            </Text>
          </View>}
          {activeCompound && (inputMode === 'catalog' || activeCompound.prediction_supported) && <Button
            label={selectedSaved ? 'Tersimpan di Koleksi' : 'Simpan senyawa ke Koleksi'}
            icon={selectedSaved ? 'check' : 'star'}
            secondary
            disabled={!!selectedSaved || !favorites.ready || !!favorites.error || busy || resolving}
            onPress={saveSelected}
          />}
          <View style={styles.fieldGroup}>
            <Text style={s.label}>
              Kode/nama sampel <Text style={s.small}>(opsional)</Text>
            </Text>
            <TextInput
              accessibilityLabel="Kode atau nama sampel"
              value={sampleName}
              onChangeText={setSampleName}
              editable={!busy}
              maxLength={80}
              placeholder="Contoh: Sampel LAB-001"
              placeholderTextColor={colors.muted}
              style={s.field}
            />
            <Text style={s.small}>Hanya untuk menandai hasil kerja Anda; tidak mengubah senyawa yang dipilih.</Text>
          </View>
          {error && <Notice error>{error}</Notice>}
          <View ref={predictRef} collapsable={false}>
            <Button
              label={busy ? (progress || 'Memeriksa senyawa…') : 'Prediksi aroma'}
              icon="arrow"
              loading={busy}
              onPress={analyze}
            />
          </View>
          <Text style={s.small}>Hasil prediksi yang berhasil otomatis masuk Riwayat.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Icon name="info" size={17} color={colors.muted} />
        <Text style={[s.small, s.grow]}>
          Analisis berfokus pada satu molekul. Prediksi aroma campuran parfum
          belum didukung aplikasi.
        </Text>
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  hero: {
    minHeight: 250,
    borderRadius: 26,
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingVertical: 25,
    gap: 20,
    overflow: 'hidden',
  },
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  heroAccent: {
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gold,
  },
  heroEyebrow: {
    fontFamily: sans,
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: '600',
    color: '#C6D9C7',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroCopy: { flex: 1, zIndex: 1 },
  heroTitle: {
    fontFamily: sans,
    fontSize: 28,
    lineHeight: 35,
    letterSpacing: -0.7,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroBody: {
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 19,
    color: '#C6D9C7',
    marginTop: 12,
    maxWidth: 240,
  },
  fieldGroup: { gap: 9 },
  mode: { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8,
    borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  advancedLink: { alignSelf: 'flex-start', paddingVertical: 6 },
  advancedText: { ...s.small, color: colors.green, fontWeight: '600' },
  candidate: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13,
    backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line,
    borderRadius: 12 },
  structureCode: { ...s.small, fontFamily: mono, marginTop: 4 },
  smiles: {
    minHeight: 105,
    fontFamily: mono,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  selected: { borderColor: colors.green, backgroundColor: '#EEF3EB' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 3 },
});
