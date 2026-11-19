import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CURATORS, fragranceById } from '../domain/catalog';
import { ACCORDS } from '../domain/models';
import { visibleLists } from '../domain/state';
import { useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { useSession } from '../storage/SessionContext';
import { CollectionRow } from '../ui/CollectionRow';
import {
  Button,
  Chip,
  Empty,
  FragranceRow,
  IconButton,
} from '../ui/components';
import {
  Avatar,
  DesignAction,
  DesignIcon,
  DesignScreen,
  PageHeader,
  Segmented,
  designStyles,
} from '../ui/design';
import { colors, s, sans, sansBold } from '../ui/theme';

const tabs = [
  { value: 'shelf', label: 'MyShelf', icon: 'shelf' },
  { value: 'saved', label: 'Saved', icon: 'bookmarkFill' },
];

export function UserProfileScreen() {
  return <ProfileView />;
}

export function OtherProfileScreen() {
  const { params } = useRoute();
  return <ProfileView authorId={params?.id} />;
}

function ProfileView({ authorId }) {
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const [tab, setTab] = useState('shelf');
  const own = !authorId;
  const profile = own
    ? state.profile
    : CURATORS.find(
        item => item.id === authorId && !state.blocked.includes(authorId),
      );
  const lists = visibleLists(state);
  const collections = profile
    ? lists.filter(list => list.authorId === profile.id)
    : [];
  const entries =
    tab === 'shelf'
      ? collections
      : own
      ? lists.filter(list => state.savedListIds.includes(list.id))
      : [];
  const perfumes =
    tab === 'saved' && own
      ? state.favorites.map(fragranceById).filter(Boolean)
      : [];
  const hidden = !own && profile?.privacy?.[tab] === true;
  const follows = state.following.includes(authorId);

  const share = async () => {
    try {
      await Share.share({
        message: [profile.name + ' on Essenza', profile.bio]
          .filter(Boolean)
          .join('\n'),
      });
    } catch {
      Alert.alert('Could not share profile', 'Please try again.');
    }
  };
  const menu = list => {
    const belongsToUser = list.authorId === state.profile.id;
    Alert.alert(
      list.title,
      undefined,
      belongsToUser
        ? [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Edit',
              onPress: () => nav.navigate('EditList', { id: list.id }),
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () =>
                Alert.alert('Delete this scentlist?', undefined, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () =>
                      dispatch({ type: 'deleteList', id: list.id }),
                  },
                ]),
            },
          ]
        : [
            { text: 'Cancel', style: 'cancel' },
            {
              text: state.savedListIds.includes(list.id)
                ? 'Unsave Scentlist'
                : 'Save Scentlist',
              onPress: () => dispatch({ type: 'bookmark', id: list.id }),
            },
          ],
    );
  };
  return (
    <DesignScreen
      paper
      header={
        <PageHeader
          title="Profile"
          onBack={own ? undefined : nav.goBack}
          bordered={false}
        />
      }
    >
      {profile ? (
        <>
          <View style={styles.profileHero}>
            <DesignIcon
              name={own ? 'profileWave' : 'otherWave'}
              style={styles.wave}
            />
            {own ? (
              <View style={styles.heroActions}>
                <IconButton
                  name="stats"
                  label="Perfume stats"
                  onPress={() => nav.navigate('Stats')}
                />
                <DesignAction
                  name="share"
                  label="Share profile"
                  onPress={share}
                />
              </View>
            ) : null}
            <View style={styles.identity}>
              <View style={styles.avatarGroup}>
                <Avatar other={!own} size={86} />
                {own ? (
                  <Pressable
                    accessibilityRole="button"
                    style={styles.edit}
                    onPress={() => nav.navigate('EditProfile')}
                  >
                    <Text style={styles.editText}>Edit Profile</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={s.flex}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {profile.name}
                </Text>
                {profile.bio ? (
                  <Text numberOfLines={3} style={designStyles.caption}>
                    {profile.bio}
                  </Text>
                ) : null}
                <View style={styles.counts}>
                  <Count value={collections.length} label="Collections" />
                  <Count value={own ? 0 : Number(follows)} label="Followers" />
                  <Count
                    value={own ? state.following.length : 0}
                    label="Following"
                  />
                </View>
              </View>
            </View>
            {!own ? (
              <Button
                label={follows ? 'Unfollow' : 'Follow'}
                variant="secondary"
                onPress={() => dispatch({ type: 'follow', authorId })}
              />
            ) : null}
          </View>
          {own ? (
            <Pressable
              accessibilityRole="button"
              style={styles.journal}
              onPress={() => nav.navigate('Journal')}
            >
              <DesignIcon name="journal" />
              <Text style={styles.editText}>See Journal</Text>
            </Pressable>
          ) : null}
          <Segmented options={tabs} value={tab} onChange={setTab} />
          {!hidden
            ? entries.map(list => (
                <CollectionRow
                  key={list.id}
                  list={list}
                  onPress={() => nav.navigate('List', { id: list.id })}
                  trailing={
                    <DesignAction
                      name="darkMenu"
                      label={list.title + ' options'}
                      onPress={() => menu(list)}
                      style={styles.verticalMenu}
                    />
                  }
                />
              ))
            : null}
          {perfumes.map(fragrance => (
            <FragranceRow
              key={fragrance.id}
              fragrance={fragrance}
              onPress={() => nav.navigate('Fragrance', { id: fragrance.id })}
            />
          ))}
          {hidden ? (
            <Empty
              title="Private"
              body="This part of the profile is private."
            />
          ) : !entries.length && !perfumes.length ? (
            <Empty
              title={
                tab === 'saved' ? 'Nothing saved yet' : 'No collections yet'
              }
              body={
                tab === 'saved'
                  ? 'Saved perfumes and scentlists appear here.'
                  : 'Scentlists appear here once created.'
              }
            />
          ) : null}
        </>
      ) : (
        <Empty
          title="Profile unavailable"
          body="This profile could not be found."
        />
      )}
    </DesignScreen>
  );
}

function Count({ value, label }) {
  return (
    <View style={styles.count}>
      <Text style={designStyles.text}>{value}</Text>
      <Text style={designStyles.caption}>{label}</Text>
    </View>
  );
}

export function SettingsScreen() {
  const { state, dispatch } = useApp();
  const { session, signOut } = useSession();
  const nav = useAppNavigation();
  const rows = [
    ['preference', 'Scent Preference', () => nav.navigate('Preference')],
    ['help', 'Help and About', () => nav.navigate('Help')],
    ['privacy', 'Privacy', () => nav.navigate('Privacy')],
    [
      'logout',
      'Log Out',
      () =>
        Alert.alert('Log out?', 'Your data will stay on this device.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', onPress: signOut },
        ]),
    ],
  ];
  return (
    <DesignScreen
      paper
      header={<PageHeader title="Settings" onBack={nav.goBack} />}
    >
      <Pressable
        style={styles.settingsRow}
        accessibilityRole="button"
        onPress={() => nav.popTo('Home', { screen: 'Profile' })}
      >
        <Avatar />
        <View style={s.flex}>
          <Text style={designStyles.strong}>{state.profile.name}</Text>
          <Text style={s.small}>{session?.email}</Text>
        </View>
        <DesignIcon name="chevron" />
      </Pressable>
      <Text style={s.h2}>General Settings</Text>
      {rows.map(([icon, label, action]) => (
        <Pressable
          style={styles.settingsRow}
          key={icon}
          accessibilityRole="button"
          onPress={action}
        >
          <DesignIcon name={icon} />
          <Text
            style={[designStyles.text, s.flex, icon === 'logout' && s.error]}
          >
            {label}
          </Text>
          {icon !== 'logout' ? <DesignIcon name="chevron" /> : null}
        </Pressable>
      ))}
      <View style={styles.reset}>
        <Button
          variant="danger"
          label="Delete all local data"
          onPress={() =>
            Alert.alert(
              'Delete all local data?',
              'Your collections, saved items and wear history will be removed from this device.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    if (await dispatch({ type: 'reset' })) {
                      await signOut?.();
                    }
                  },
                },
              ],
            )
          }
        />
      </View>
    </DesignScreen>
  );
}

export function EditProfileScreen() {
  const { state, dispatch } = useApp();
  const { session } = useSession();
  const nav = useAppNavigation();
  const [name, setName] = useState(state.profile.name);
  const [bio, setBio] = useState(state.profile.bio);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const saved = await dispatch({
      type: 'profile',
      profile: { ...state.profile, name, bio },
    });
    setBusy(false);
    if (saved) {
      nav.goBack();
    }
  };
  return (
    <DesignScreen
      paper
      header={
        <PageHeader title="Edit Profile" onBack={nav.goBack} bordered={false} />
      }
    >
      <View style={styles.editHero}>
        <DesignIcon name="profileWave" style={styles.wave} />
        <Avatar size={105} />
      </View>
      <ProfileField
        label="Username"
        value={name}
        onChangeText={setName}
        limit={20}
      />
      <ProfileField label="Email" value={session?.email || ''} />
      <ProfileField
        label="Bio"
        value={bio}
        onChangeText={setBio}
        limit={50}
        multiline
      />
      <Button
        label="Save Changes"
        loading={busy}
        disabled={!name.trim() || name.trim().length > 20 || bio.length > 50}
        onPress={save}
      />
    </DesignScreen>
  );
}

function ProfileField({ label, value, onChangeText, limit, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={designStyles.caption}>{label}</Text>
      <View style={styles.inputBox}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          editable={Boolean(onChangeText)}
          onChangeText={onChangeText}
          maxLength={limit}
          multiline={multiline}
          style={[styles.input, multiline && styles.bio]}
        />
        {limit ? (
          <Text style={styles.limit}>
            {value.length}/{limit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function PreferenceScreen() {
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const [likes, setLikes] = useState(state.profile.likes);
  const [avoids, setAvoids] = useState(state.profile.avoids);
  const [busy, setBusy] = useState(false);
  const toggle = (accord, preferred) => {
    const update = items =>
      items.includes(accord)
        ? items.filter(item => item !== accord)
        : [...items, accord];
    const clear = items => items.filter(item => item !== accord);
    setLikes(preferred ? update : clear);
    setAvoids(preferred ? clear : update);
  };
  return (
    <DesignScreen
      paper
      header={<PageHeader title="Scent Preference" onBack={nav.goBack} />}
    >
      {[
        ['Scents you like', likes, true],
        ['Scents you avoid', avoids, false],
      ].map(([label, selected, preferred]) => (
        <View key={label} style={designStyles.stack}>
          <Text style={designStyles.strong}>{label}</Text>
          <View style={s.wrap}>
            {ACCORDS.map(accord => (
              <Chip
                key={accord}
                compact
                label={accord[0].toUpperCase() + accord.slice(1)}
                selected={selected.includes(accord)}
                onPress={() => toggle(accord, preferred)}
              />
            ))}
          </View>
        </View>
      ))}
      <Button
        label="Save Preferences"
        loading={busy}
        onPress={async () => {
          setBusy(true);
          const saved = await dispatch({
            type: 'profile',
            profile: { ...state.profile, likes, avoids },
          });
          setBusy(false);
          if (saved) {
            nav.goBack();
          }
        }}
      />
    </DesignScreen>
  );
}

export function PrivacyScreen() {
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  return (
    <DesignScreen
      paper
      header={<PageHeader title="Privacy" onBack={nav.goBack} />}
    >
      <Text style={s.body}>
        Your wear journal is private. Set your preferences for when your profile
        is shared.
      </Text>
      {[
        ['shelf', 'Private MyShelf'],
        ['saved', 'Private Saved'],
      ].map(([section, label]) => (
        <View style={s.between} key={section}>
          <Text style={designStyles.text}>{label}</Text>
          <Switch
            accessibilityLabel={label}
            value={state.privacy[section]}
            onValueChange={value =>
              dispatch({ type: 'privacy', section, value })
            }
          />
        </View>
      ))}
    </DesignScreen>
  );
}

export function HelpScreen() {
  const nav = useAppNavigation();
  return (
    <DesignScreen
      paper
      header={<PageHeader title="Help and About" onBack={nav.goBack} />}
    >
      <Text style={s.h2}>About Essenza</Text>
      <Text style={s.body}>
        Essenza helps you discover fragrance notes, organize perfumes into
        scentlists, and keep a personal wear journal.
      </Text>
      <Text style={s.h3}>How do I record a wear?</Text>
      <Text style={s.body}>
        Open a fragrance, select Log wear, and save the date, occasion, and any
        notes you want to keep.
      </Text>
      <Text style={s.h3}>Where do I find wear statistics?</Text>
      <Text style={s.body}>
        Open Profile and select Perfume Stats to see how often you have worn
        each fragrance.
      </Text>
    </DesignScreen>
  );
}

export function NotificationsScreen() {
  const nav = useAppNavigation();
  return (
    <DesignScreen
      paper
      header={<PageHeader title="Notifications" onBack={nav.goBack} />}
    >
      <Empty title="No notifications" body="You’re all caught up." />
    </DesignScreen>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    minHeight: 190,
    paddingHorizontal: 10,
    gap: 8,
    justifyContent: 'center',
  },
  wave: { position: 'absolute', left: -44, top: -8 },
  heroActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingBottom: 6,
  },
  avatarGroup: { alignItems: 'center', gap: 8 },
  profileName: { fontFamily: sansBold, fontSize: 26, color: colors.green },
  counts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 10,
  },
  count: { alignItems: 'center', flexShrink: 1 },
  edit: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.green,
    borderRadius: 20,
  },
  editText: { color: colors.white, fontFamily: sansBold, fontSize: 12 },
  journal: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
    gap: 6,
    borderRadius: 8,
  },
  verticalMenu: { transform: [{ rotate: '90deg' }] },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 42,
  },
  reset: {
    marginTop: 'auto',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  editHero: {
    alignItems: 'center',
    paddingTop: 34,
    paddingBottom: 28,
    minHeight: 170,
  },
  field: { gap: 4 },
  inputBox: { borderWidth: 1, borderColor: '#BFBFBF', borderRadius: 8 },
  input: {
    paddingHorizontal: 12,
    minHeight: 42,
    fontFamily: sans,
    color: colors.ink,
    fontSize: 16,
  },
  bio: { minHeight: 72, textAlignVertical: 'top' },
  limit: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'right',
    paddingRight: 8,
    paddingBottom: 5,
  },
});
