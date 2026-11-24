import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { usePreventRemove, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { fragranceById } from '../domain/catalog';
import { makeId } from '../domain/models';
import { openShelf, useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { CollectionArtwork } from '../ui/CollectionRow';
import { Empty } from '../ui/components';
import { DesignIcon, DesignScreen, PageHeader } from '../ui/design';
import { figma } from '../ui/figmaAssets';
import { Sheet } from '../ui/Sheet';
import { colors, s, sans, sansBold, serif } from '../ui/theme';

const coverColors = [
  { value: colors.green, label: 'Forest Green', icon: 'coverGreen' },
  { value: '#494A65', label: 'Slate Blue', icon: 'coverBlue' },
  { value: '#5B351D', label: 'Chestnut', icon: 'coverBrown' },
  { value: '#586C57', label: 'Sage' },
  { value: '#804F53', label: 'Rose' },
  { value: '#887045', label: 'Ochre' },
  { value: '#62546F', label: 'Plum' },
  { value: '#466578', label: 'Ocean' },
  { value: '#395759', label: 'Teal' },
  { value: '#555254', label: 'Charcoal' },
];

export function EditListScreen() {
  const { params } = useRoute();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const original = state.lists.find(list => list.id === params?.id);
  const [initial] = useState(() => ({
    title: original?.title ?? 'Scentlist #' + (state.lists.length + 1),
    description: original?.description ?? '',
    visibility: original?.visibility ?? 'public',
    color: original?.color ?? colors.green,
    cover: original?.cover ?? null,
  }));
  const [id] = useState(() => original?.id ?? makeId('list'));
  const [form, setForm] = useState(initial);
  const [showColors, setShowColors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const choosingPhoto = useRef(false);
  const saving = useRef(false);
  const dirty = Object.keys(initial).some(key => form[key] !== initial[key]);
  const isNew = !params?.id;

  usePreventRemove((dirty || busy) && !saved, ({ data }) => {
    if (saving.current) {
      return;
    }
    Alert.alert('Unsaved Changes', 'Discard changes and leave?', [
      { text: 'Keep Editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => nav.dispatch(data.action),
      },
    ]);
  });

  useEffect(() => {
    if (saved) {
      nav.goBack();
      if (isNew) {
        openShelf(nav, { section: 'lists', highlightId: id });
      }
    }
  }, [saved, isNew, nav, id]);

  const update = (key, value) =>
    setForm(current => ({ ...current, [key]: value }));

  const chooseCover = async () => {
    if (choosingPhoto.current || saving.current) {
      return;
    }
    choosingPhoto.current = true;
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.72,
        includeBase64: true,
        assetRepresentationMode: 'compatible',
      });
      if (result.didCancel) {
        return;
      }
      const image = result.assets?.[0];
      if (!image?.base64 || !/^image\/(jpe?g|png|webp)$/i.test(image.type)) {
        throw new Error('Choose a JPG, PNG, or WebP image.');
      }
      if (image.base64.length > 400000) {
        throw new Error('Choose a smaller photo.');
      }
      update('cover', 'data:' + image.type + ';base64,' + image.base64);
    } catch (error) {
      Alert.alert('Could Not Open Photo', error.message);
    } finally {
      choosingPhoto.current = false;
    }
  };

  const save = async () => {
    if (saving.current || !form.title.trim() || choosingPhoto.current) {
      return;
    }
    saving.current = true;
    setBusy(true);
    const updatedAt = new Date().toISOString();
    try {
      const didSave = await dispatch(
        isNew
          ? {
              type: 'saveList',
              list: {
                ...form,
                id,
                authorId: state.profile.id,
                updatedAt,
                items: fragranceById(params?.fragranceId)
                  ? [{ fragranceId: params.fragranceId, note: '' }]
                  : [],
              },
            }
          : { type: 'updateList', id, changes: form, updatedAt },
      );
      if (didSave) {
        setSaved(true);
      }
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };

  const primary = coverColors.slice(0, 3);
  const selectedColor = coverColors.find(option => option.value === form.color);
  const privateList = form.visibility === 'private';
  const header = (
    <PageHeader
      title={isNew ? 'New Scentlist' : 'Edit Scentlist'}
      onBack={nav.goBack}
      bordered={false}
    />
  );

  return (
    <DesignScreen
      header={header}
      style={styles.screen}
      contentStyle={styles.content}
    >
      {isNew || original ? (
        <>
          <View style={styles.intro}>
            <Text style={styles.title}>Set the mood</Text>
            <Text style={styles.caption}>
              Create and customize your Scentlist.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change Cover"
            onPress={chooseCover}
            style={styles.changeCover}
          >
            <View style={[styles.preview, { backgroundColor: form.color }]}>
              {form.cover ? (
                <CollectionArtwork
                  list={{ ...form, id, items: [] }}
                  style={styles.coverImage}
                />
              ) : null}
              <View style={styles.pencil}>
                <DesignIcon name="coverPencil" />
              </View>
            </View>
            <Text style={styles.action}>Change Cover</Text>
          </Pressable>
          <ScentlistField
            label="Scentlist Name"
            limit={20}
            value={form.title}
            onChangeText={value => update('title', value)}
          />
          <ScentlistField
            label="Description"
            placeholder="Describe the mood or occasion"
            limit={30}
            multiline
            value={form.description}
            onChangeText={value => update('description', value)}
          />
          <View style={styles.colorGroup}>
            <Text style={styles.label}>Cover Color</Text>
            <View style={styles.colors}>
              {primary.map(option => (
                <ColorSwatch
                  key={option.value}
                  option={option}
                  selected={form.color === option.value}
                  onPress={() => update('color', option.value)}
                />
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="More cover colors"
                onPress={() => setShowColors(true)}
                style={styles.wheel}
              >
                <Image
                  source={figma.colorWheel}
                  style={[styles.wheel, styles.wheelImage]}
                />
                <Text style={styles.wheelPlus}>+</Text>
                {selectedColor && !selectedColor.icon ? (
                  <View
                    style={[
                      styles.customDot,
                      { backgroundColor: selectedColor.value },
                    ]}
                  />
                ) : null}
              </Pressable>
            </View>
          </View>
          <View style={s.between}>
            <View style={styles.privateLabel}>
              <DesignIcon name="coverLock" />
              <Text style={styles.privateText}>Private</Text>
            </View>
            <Switch
              accessibilityLabel="Private scentlist"
              value={privateList}
              onValueChange={value =>
                update('visibility', value ? 'private' : 'public')
              }
              trackColor={{ false: '#D8D8D8', true: '#92B4A2' }}
              thumbColor={privateList ? colors.green : '#595959'}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save Scentlist"
            accessibilityState={{ disabled: busy || !form.title.trim() }}
            disabled={busy || !form.title.trim()}
            onPress={save}
            style={[
              styles.save,
              (busy || !form.title.trim()) && styles.disabled,
            ]}
          >
            <DesignIcon name="coverSave" />
            <Text style={styles.saveText}>
              {busy ? 'Saving…' : 'Save Scentlist'}
            </Text>
          </Pressable>
          {showColors ? (
            <Sheet title="Cover Color" onClose={() => setShowColors(false)}>
              <View style={styles.colors}>
                {coverColors.map(option => (
                  <ColorSwatch
                    key={option.value}
                    option={option}
                    selected={form.color === option.value}
                    onPress={() => {
                      update('color', option.value);
                      setShowColors(false);
                    }}
                  />
                ))}
              </View>
            </Sheet>
          ) : null}
        </>
      ) : (
        <Empty
          title="Scentlist unavailable"
          body="You can edit your own scentlists."
        />
      )}
    </DesignScreen>
  );
}

function ScentlistField({ label, limit, value, multiline, ...props }) {
  const [maxLength] = useState(() => Math.max(value.length, limit));
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, multiline && styles.description]}>
        <TextInput
          accessibilityLabel={label}
          maxLength={value.length > limit ? maxLength : limit}
          multiline={multiline}
          placeholderTextColor="#949494"
          value={value}
          style={[styles.input, multiline && styles.multiline]}
          {...props}
        />
        <Text style={styles.counter}>
          {value.length}/{limit}
        </Text>
      </View>
    </View>
  );
}

function ColorSwatch({ option, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.wheel, { backgroundColor: option.value }]}
    >
      {option.icon ? <DesignIcon name={option.icon} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.ivory },
  content: { gap: 8, paddingTop: 12 },
  intro: { gap: 3 },
  title: { color: colors.green, fontFamily: serif, fontSize: 32 },
  caption: { color: '#79776C', fontFamily: sans, fontSize: 12 },
  changeCover: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
    marginBottom: 10,
  },
  preview: { width: 104, height: 104, borderRadius: 8, overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%', borderRadius: 0 },
  pencil: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: { color: colors.green, fontFamily: sansBold, fontSize: 12 },
  field: { gap: 9 },
  label: { color: colors.green, fontFamily: sans, fontSize: 12 },
  inputBox: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFBFBF',
    minHeight: 42,
    justifyContent: 'center',
  },
  description: { minHeight: 90 },
  input: {
    fontFamily: sans,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingRight: 50,
    minHeight: 40,
  },
  multiline: {
    flex: 1,
    paddingRight: 12,
    paddingBottom: 20,
    textAlignVertical: 'top',
  },
  counter: {
    position: 'absolute',
    right: 7,
    bottom: 4,
    color: '#777777',
    fontFamily: sans,
    fontSize: 11,
  },
  colorGroup: { gap: 6 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  wheel: {
    width: 51,
    height: 51,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelImage: { opacity: 0.48 },
  wheelPlus: {
    position: 'absolute',
    color: '#282828',
    fontFamily: sans,
    fontSize: 36,
    lineHeight: 37,
    includeFontPadding: false,
  },
  customDot: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.white,
    bottom: 2,
    right: 2,
  },
  privateLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  privateText: { color: colors.ink, fontFamily: sans, fontSize: 14 },
  save: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.green,
  },
  disabled: { opacity: 0.55 },
  saveText: { color: colors.white, fontFamily: sansBold, fontSize: 12 },
});
