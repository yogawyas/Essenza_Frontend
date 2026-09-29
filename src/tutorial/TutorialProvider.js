import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, s, sans } from '../ui/theme';

export const TUTORIAL_KEY = '@essenza/b2b-tutorial-seen-v2';
const Context = createContext(null);
const STEPS = [
  { target: 'catalog', title: 'Pilih senyawa', body: 'Ketuk daftar senyawa ini. Cari nama bahan, lalu pilih yang ingin dicek.' },
  { target: 'translator', title: 'Atau ketik nama / rumus', body: 'Kalau bahan belum ketemu di daftar, ketik nama umum atau rumusnya. Periksa pilihan struktur sebelum diprediksi.' },
  { target: 'predict', title: 'Lihat profil aromanya', body: 'Setelah memilih bahan, tekan Prediksi aroma. Hasilnya menunjukkan beberapa karakter aroma yang mungkin muncul.' },
  { target: 'collection', title: 'Simpan bahan favorit', body: 'Di Koleksi, bahan yang sering dipakai bisa diberi catatan dan dianalisis ulang.' },
  { target: 'guide', title: 'Bantuan selalu ada', body: 'Buka Panduan kapan saja untuk memahami hasil atau mengulang tutorial ini.' },
];

export function TutorialProvider({ children, enabled }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [cardHeight, setCardHeight] = useState(205);
  const [checked, setChecked] = useState(false);
  const anchors = useRef({});
  const { width, height } = useWindowDimensions();
  useEffect(() => {
    if (!enabled || checked) { return; }
    let active = true;
    AsyncStorage.getItem(TUTORIAL_KEY)
      .then(value => { if (active && value !== 'seen') { setVisible(true); } })
      .catch(() => { if (active) { setVisible(true); } })
      .finally(() => { if (active) { setChecked(true); } });
    return () => { active = false; };
  }, [enabled, checked]);
  const registerAnchor = useCallback((name, ref) => {
    anchors.current[name] = ref;
  }, []);
  const openTutorial = useCallback(() => { setStep(0); setVisible(true); }, []);
  const closeTutorial = useCallback(() => {
    setVisible(false);
    AsyncStorage.setItem(TUTORIAL_KEY, 'seen').catch(() => undefined);
  }, []);
  const next = () => {
    if (step === STEPS.length - 1) { closeTutorial(); }
    else { setStep(value => value + 1); }
  };
  useEffect(() => {
    if (!visible) { return; }
    const target = STEPS[step].target;
    if (target === 'collection' || target === 'guide') {
      const index = target === 'collection' ? 1 : 3;
      setRect({ x: width * index / 4, y: height - 69, width: width / 4, height: 62 });
      return;
    }
    const timer = setTimeout(() => {
      const node = anchors.current[target]?.current;
      node?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
        if (measuredWidth > 0 && measuredHeight > 0) {
          setRect({ x, y, width: measuredWidth, height: measuredHeight });
        }
      });
    }, 550);
    return () => clearTimeout(timer);
  }, [visible, step, width, height]);

  const target = rect && rect.y >= 0 && rect.y < height && rect.x >= 0
    ? { x: Math.max(4, rect.x - 5), y: Math.max(4, rect.y - 5),
      width: Math.min(width - rect.x, rect.width + 10),
      height: Math.min(height - rect.y, rect.height + 10) }
    : { x: width * 0.1, y: height * 0.36, width: width * 0.8, height: 58 };
  const below = target.y + target.height + cardHeight + 28 < height;
  const cardTop = below ? target.y + target.height + 18
    : Math.max(35, target.y - cardHeight - 18);
  return <Context.Provider value={{ visible, step, registerAnchor, openTutorial }}>
    {children}
    <Modal visible={visible && enabled} transparent statusBarTranslucent animationType="fade"
      onRequestClose={closeTutorial}>
      <View style={styles.overlay}>
        <View style={[styles.shade, styles.topShade, { width, height: target.y }]} />
        <View style={[styles.shade, styles.leftShade, { top: target.y,
          width: target.x, height: target.height }]} />
        <View style={[styles.shade, { left: target.x + target.width, top: target.y,
          width: Math.max(0, width - target.x - target.width), height: target.height }]} />
        <View style={[styles.shade, styles.leftShade, { top: target.y + target.height,
          width, height: Math.max(0, height - target.y - target.height) }]} />
        <View pointerEvents="none" style={[styles.focus, {
          left: target.x, top: target.y, width: target.width, height: target.height,
        }]} />
        <View style={[styles.arrow, below
          ? { top: cardTop - 22, left: Math.min(width - 60, target.x + 28), borderBottomColor: colors.paper }
          : { top: cardTop + cardHeight - 2, left: Math.min(width - 60, target.x + 28), borderTopColor: colors.paper }]} />
        <View onLayout={event => setCardHeight(event.nativeEvent.layout.height)}
          style={[styles.card, { top: cardTop, width: width - 40 }]}>
          <Text style={s.eyebrow}>PANDUAN SINGKAT · {step + 1}/{STEPS.length}</Text>
          <Text style={s.heading}>{STEPS[step].title}</Text>
          <Text style={s.body}>{STEPS[step].body}</Text>
          <View style={styles.buttons}>
            <Pressable accessibilityRole="button" accessibilityLabel="Lewati tutorial"
              onPress={closeTutorial} style={styles.skip}>
              <Text style={s.label}>Lewati</Text>
            </Pressable>
            <Pressable accessibilityRole="button"
              accessibilityLabel={step === STEPS.length - 1 ? 'Selesai tutorial' : 'Langkah berikutnya'}
              onPress={next} style={styles.next}>
              <Text style={styles.nextText}>{step === STEPS.length - 1 ? 'Selesai' : 'Lanjut →'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  </Context.Provider>;
}

export function useTutorial() {
  const value = useContext(Context);
  if (!value) { throw new Error('TutorialProvider diperlukan.'); }
  return value;
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  shade: { position: 'absolute', backgroundColor: '#07120DC9' },
  topShade: { left: 0, top: 0 },
  leftShade: { left: 0 },
  focus: { position: 'absolute', borderWidth: 3, borderColor: colors.gold,
    borderRadius: 13, backgroundColor: '#FFFFFF14' },
  card: { position: 'absolute', left: 20, backgroundColor: colors.paper, borderRadius: 18,
    padding: 20, gap: 11, elevation: 9 },
  arrow: { position: 'absolute', width: 0, height: 0,
    borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 12,
    borderTopWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: 'transparent', borderTopColor: 'transparent' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  skip: { paddingHorizontal: 14, minHeight: 42, justifyContent: 'center' },
  next: { backgroundColor: colors.green, borderRadius: 10, paddingHorizontal: 18,
    minHeight: 42, justifyContent: 'center' },
  nextText: { fontFamily: sans, fontSize: 13, color: colors.paper, fontWeight: '700' },
});
