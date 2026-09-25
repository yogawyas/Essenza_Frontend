import React, { useCallback, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { inputError } from '../domain/analysis';
import { demoPredictionService, EXAMPLES } from '../services/demoPrediction';
import { Button, Notice, Page, SectionTitle } from '../ui/components';
import { Icon, MoleculeMark } from '../ui/Icon';
import { colors, mono, s } from '../ui/theme';
export function AnalysisScreen({ service = demoPredictionService }) {
  const navigation = useNavigation();
  const [smiles, setSmiles] = useState('');
  const [sampleName, setSampleName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inFlight = useRef(false);
  const requestVersion = useRef(0);
  useFocusEffect(
    useCallback(() => {
      return () => {
        requestVersion.current += 1;
        inFlight.current = false;
        setBusy(false);
      };
    }, []),
  );
  const analyze = async () => {
    if (inFlight.current) {
      return;
    }
    const problem = inputError(smiles);
    setError(problem);
    if (problem) {
      return;
    }
    Keyboard.dismiss();
    inFlight.current = true;
    const version = ++requestVersion.current;
    setBusy(true);
    try {
      const result = await service.predict({ smiles, sampleName });
      if (version === requestVersion.current) {
        navigation.navigate('Result', { result });
      }
    } catch (cause) {
      if (version === requestVersion.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Contoh belum dapat dimuat. Silakan coba lagi.',
        );
      }
    } finally {
      if (version === requestVersion.current) {
        inFlight.current = false;
        setBusy(false);
      }
    }
  };
  return (
    <Page>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>RUANG KERJA LABORATORIUM</Text>
        <View style={s.row}>
          <View style={s.grow}>
            <Text style={styles.heroTitle}>
              Satu molekul.{'\n'}Beragam aroma.
            </Text>
            <Text style={styles.heroBody}>
              Eksplorasi profil aroma molekul dalam satu ruang analisis.
            </Text>
          </View>
          <MoleculeMark />
        </View>
        <View style={styles.heroFooter}>
          <View style={styles.liveDot} />
          <Text style={styles.heroCaption}>MODE DEMO</Text>
          <Text style={styles.heroHint}>Data contoh · tanpa koneksi API</Text>
        </View>
      </View>

      <View style={s.stack}>
        <SectionTitle number="01" title="Analisis molekul" />
        <View style={s.card}>
          <View style={styles.fieldGroup}>
            <Text style={s.label}>
              Nama sampel <Text style={s.small}>(opsional)</Text>
            </Text>
            <TextInput
              accessibilityLabel="Nama sampel"
              value={sampleName}
              onChangeText={setSampleName}
              editable={!busy}
              maxLength={80}
              placeholder="Contoh: Sampel LAB-001"
              placeholderTextColor={colors.muted}
              style={s.field}
            />
          </View>
          <View style={styles.fieldGroup}>
            <View style={s.between}>
              <Text style={s.label}>Struktur molekul</Text>
              <Text style={s.eyebrow}>SMILES</Text>
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
              Pilih contoh di bawah untuk mencoba. Struktur belum divalidasi
              dengan RDKit pada mode demo.
            </Text>
          </View>
          {error && <Notice error>{error}</Notice>}
          <Button
            label={busy ? 'Menyiapkan contoh…' : 'Lihat contoh hasil'}
            icon="arrow"
            loading={busy}
            onPress={analyze}
          />
        </View>
      </View>

      <View style={s.stack}>
        <SectionTitle number="02" title="Molekul contoh" detail="4 contoh" />
        <Text style={s.body}>
          Mulai dari contoh yang tersedia. Label dan skor dibuat khusus untuk
          demonstrasi tampilan.
        </Text>
        <View style={styles.examples}>
          {EXAMPLES.map((example, index) => {
            const selected = smiles.trim() === example.smiles;
            return (
              <Pressable
                key={example.smiles}
                accessibilityRole="button"
                accessibilityLabel={`Pilih ${example.name}`}
                accessibilityState={{ selected, disabled: busy }}
                disabled={busy}
                onPress={() => {
                  setSmiles(example.smiles);
                  setSampleName(example.name);
                  setError(null);
                }}
                style={({ pressed }) => [
                  styles.example,
                  selected && styles.selected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.exampleIcon}>
                  <Icon name={selected ? 'check' : 'flask'} size={19} />
                </View>
                <View style={s.grow}>
                  <Text style={styles.exampleName}>{example.name}</Text>
                  <Text style={s.small}>{example.description}</Text>
                </View>
                <Text style={styles.exampleIndex}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.footer}>
        <Icon name="info" size={17} color={colors.muted} />
        <Text style={[s.small, s.grow]}>
          Analisis berfokus pada satu molekul. Prediksi aroma campuran parfum
          berada di luar cakupan model.
        </Text>
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    backgroundColor: colors.ink,
    padding: 22,
    gap: 18,
    overflow: 'hidden',
  },
  heroEyebrow: {
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: '600',
    color: '#C6D9C7',
  },
  heroTitle: {
    fontSize: 29,
    lineHeight: 36,
    letterSpacing: -0.9,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  heroBody: { fontSize: 12, lineHeight: 19, color: '#C6D9C7', marginTop: 10 },
  heroFooter: {
    borderTopWidth: 1,
    borderColor: '#436054',
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  heroCaption: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroHint: { color: '#C6D9C7', fontSize: 10, marginLeft: 5 },
  fieldGroup: { gap: 9 },
  smiles: {
    minHeight: 105,
    fontFamily: mono,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  examples: { gap: 10 },
  example: {
    minHeight: 76,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  selected: { borderColor: colors.green, backgroundColor: '#EEF3EB' },
  exampleIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleName: {
    fontSize: 15,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: 2,
  },
  exampleIndex: { fontFamily: mono, color: colors.muted, fontSize: 11 },
  pressed: { opacity: 0.7 },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 3 },
});
