import React, { useRef, useState } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import { CURATORS, fragranceById } from '../domain/catalog';
import { ACCORDS } from '../domain/models';
import { visibleLists } from '../domain/state';
import { useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { useSession } from '../storage/SessionContext';
import { CollectionRow } from '../ui/CollectionRow';
import { ScentlistMenu } from '../ui/ScentlistMenu';
import { OptionSheet } from '../ui/OptionSheet';
import { pickLibraryPhoto } from '../ui/photoLibrary';
import { Button, Chip, Empty, FragranceRow } from '../ui/components';
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
  { value: 'shelf', label: 'MyShelf', icon: 'shelfSelected' },
  { value: 'saved', label: 'Saved', icon: 'bookmarkFill' },
];

function profileActivity(state, authorId, lists) {
  const own = !authorId;
  const curators = CURATORS.filter(
    account => !state.blocked.includes(account.id),
  );
  const profile = own
    ? state.profile
    : curators.find(account => account.id === authorId);
  const follows = !own && state.following.includes(authorId);
  return {
    profile,
    follows,
    collections:
      profile && (own || !profile.privacy?.shelf)
        ? lists.filter(list => list.authorId === profile.id)
        : [],
    followers: profile && follows ? [state.profile] : [],
    following: own
      ? curators.filter(account => state.following.includes(account.id))
      : [],
  };
}

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
  const [menuId, setMenuId] = useState(null);
  const own = !authorId;
  const lists = visibleLists(state);
  const { profile, follows, collections, followers, following } =
    profileActivity(state, authorId, lists);
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
  const openDirectory = section =>
    nav.navigate('ProfileDirectory', { authorId, section });

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
  const selectedList = lists.find(list => list.id === menuId);
  const closeMenu = () => setMenuId(null);
  return (
    <DesignScreen
      paper
      contentStyle={styles.profileContent}
      header={
        own ? undefined : (
          <PageHeader title="Profile" onBack={nav.goBack} bordered={false} />
        )
      }
      background={
        <LinearGradient
          pointerEvents="none"
          colors={[profile?.color || '#A6E2EF', colors.white]}
          locations={[0, 0.52]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.14, y: 1 }}
          style={styles.profileGradient}
        />
      }
    >
      {profile ? (
        <>
          <View style={styles.profileHero}>
            {own ? (
              <View style={styles.heroActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Perfume stats"
                  onPress={() => nav.navigate('Stats')}
                  style={styles.statsAction}
                >
                  <View style={styles.statsIcon} pointerEvents="none">
                    <View style={[styles.statBar, styles.statLeft]} />
                    <View style={[styles.statBar, styles.statMiddle]} />
                    <View style={[styles.statBar, styles.statRight]} />
                  </View>
                </Pressable>
                <DesignAction
                  name="share"
                  label="Share profile"
                  onPress={share}
                />
              </View>
            ) : null}
            <View style={styles.identity}>
              <View style={styles.avatarGroup}>
                <Avatar photoUri={profile.photoUri} other={!own} size={84} />
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
                  <Count
                    value={collections.length}
                    label="Collections"
                    onPress={() => openDirectory('collections')}
                  />
                  <Count
                    value={followers.length}
                    label="Followers"
                    onPress={() => openDirectory('followers')}
                  />
                  <Count
                    value={following.length}
                    label="Following"
                    onPress={() => openDirectory('following')}
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
          <Segmented options={tabs} value={tab} onChange={setTab} stacked />
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
                      onPress={() => setMenuId(list.id)}
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
          {selectedList && selectedList.authorId === state.profile.id ? (
            <ScentlistMenu
              list={selectedList}
              onClose={closeMenu}
              onEdit={() => nav.navigate('EditList', { id: selectedList.id })}
            />
          ) : selectedList ? (
            <OptionSheet
              onClose={closeMenu}
              rows={[
                {
                  label: state.savedListIds.includes(selectedList.id)
                    ? 'Unsave Scentlist'
                    : 'Save Scentlist',
                  icon: 'bookmarkFill',
                  onPress: async () => {
                    if (
                      await dispatch({ type: 'bookmark', id: selectedList.id })
                    ) {
                      closeMenu();
                    }
                  },
                },
              ]}
            />
          ) : null}
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

export function ProfileDirectoryScreen() {
  const { params } = useRoute();
  const { state } = useApp();
  const nav = useAppNavigation();
  const { authorId, section } = params ?? {};
  const showCollections = section === 'collections';
  const [tab, setTab] = useState(
    section === 'following' ? 'following' : 'followers',
  );
  const { profile, collections, followers, following } = profileActivity(
    state,
    authorId,
    visibleLists(state),
  );
  const accounts = tab === 'followers' ? followers : following;
  const openProfile = id => {
    if (id === state.profile.id) {
      nav.popTo('Home', {
        screen: 'Profile',
        params: { screen: 'ProfileHome', pop: true },
      });
    } else {
      nav.navigate('OtherProfile', { id });
    }
  };

  return (
    <DesignScreen
      paper
      contentStyle={showCollections && styles.collectionsContent}
      header={
        <PageHeader
          title={showCollections ? 'Collections' : profile?.name || 'Profile'}
          onBack={nav.goBack}
        />
      }
    >
      {!profile ? (
        <Text style={designStyles.caption}>
          This profile could not be found.
        </Text>
      ) : showCollections ? (
        authorId && profile.privacy?.shelf ? (
          <Text style={designStyles.caption}>
            These collections are private.
          </Text>
        ) : collections.length ? (
          collections.map(list => (
            <CollectionRow
              key={list.id}
              list={list}
              onPress={() => nav.navigate('List', { id: list.id })}
            />
          ))
        ) : (
          <Text style={designStyles.caption}>No collections to show.</Text>
        )
      ) : (
        <>
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'followers', label: followers.length + ' Followers' },
              { value: 'following', label: following.length + ' Following' },
            ]}
          />
          {accounts.length ? (
            accounts.map(account => (
              <Pressable
                key={account.id}
                accessibilityRole="button"
                accessibilityLabel={'View profile: ' + account.name}
                onPress={() => openProfile(account.id)}
                style={styles.accountRow}
              >
                <Avatar
                  photoUri={account.photoUri}
                  size={44}
                  other={account.id !== state.profile.id}
                />
                <View style={s.flex}>
                  <Text numberOfLines={1} style={designStyles.strong}>
                    {account.name}
                  </Text>
                  {account.bio ? (
                    <Text numberOfLines={2} style={designStyles.caption}>
                      {account.bio}
                    </Text>
                  ) : null}
                </View>
                <DesignIcon name="chevron" />
              </Pressable>
            ))
          ) : (
            <Text style={designStyles.caption}>
              {tab === 'followers'
                ? 'No followers to show.'
                : 'No accounts to show.'}
            </Text>
          )}
        </>
      )}
    </DesignScreen>
  );
}

function Count({ value, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value + ' ' + label}
      onPress={onPress}
      style={styles.count}
    >
      <Text style={designStyles.text}>{value}</Text>
      <Text style={designStyles.caption}>{label}</Text>
    </Pressable>
  );
}

export function SettingsScreen() {
  const { state, dispatch, isCloud } = useApp();
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
        Alert.alert('Log out?', isCloud ? 'Your data will stay in your account.' : 'Your data will stay on this device.', [
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
        <Avatar photoUri={state.profile.photoUri} />
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
          label={isCloud ? 'Reset account data' : 'Delete all local data'}
          onPress={() =>
            Alert.alert(
              isCloud ? 'Reset account data?' : 'Delete all local data?',
              isCloud
                ? 'This removes your profile, collections and wear history across devices. You can still sign in.'
                : 'Your collections, saved items and wear history will be removed from this device.',
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
  const [photoUri, setPhotoUri] = useState(state.profile.photoUri);
  const [busy, setBusy] = useState(false);
  const canSave =
    Boolean(name.trim()) &&
    (name === state.profile.name || name.trim().length <= 20) &&
    (bio === state.profile.bio || bio.length <= 50);
  const pickingPhoto = useRef(false);
  const choosePhoto = async () => {
    if (busy || pickingPhoto.current) {
      return;
    }
    pickingPhoto.current = true;
    try {
      // Keep the photo small in the private account snapshot.
      const photo = await pickLibraryPhoto({
        size: 256,
        maxEncodedLength: 96000,
      });
      if (photo) {
        setPhotoUri(photo);
      }
    } catch (error) {
      Alert.alert('Could Not Open Photo', error.message);
    } finally {
      pickingPhoto.current = false;
    }
  };

  const save = async () => {
    if (!canSave || busy || pickingPhoto.current) {
      return;
    }
    setBusy(true);
    const saved = await dispatch({
      type: 'profile',
      profile: {
        ...state.profile,
        name,
        bio,
        ...(photoUri ? { photoUri } : {}),
      },
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change Photo"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={choosePhoto}
          style={styles.photoAction}
        >
          <Avatar photoUri={photoUri} size={105} />
          <Text style={designStyles.text}>Change Photo</Text>
        </Pressable>
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
        disabled={!canSave}
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
  const { state, dispatch, isCloud } = useApp();
  const nav = useAppNavigation();
  return (
    <DesignScreen
      paper
      header={<PageHeader title="Privacy" onBack={nav.goBack} />}
    >
      <Text style={s.body}>
        {isCloud
          ? 'Your profile, collections and wear journal are only accessible through your account.'
          : 'Your wear journal is private. Set your preferences for when your profile is shared.'}
      </Text>
      {!isCloud && [
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
  profileGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 170,
  },
  profileHero: {
    paddingHorizontal: 4,
    paddingTop: 12,
    gap: 4,
    justifyContent: 'center',
  },
  wave: { position: 'absolute', left: -44, top: -8 },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: -14,
  },
  statsAction: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsIcon: { width: 29, height: 40 },
  statBar: {
    position: 'absolute',
    bottom: '16.67%',
    borderWidth: 2,
    borderRadius: 1,
    borderColor: colors.green,
    width: '16.67%',
  },
  statLeft: { left: '8.33%', top: '37.5%' },
  statMiddle: { left: '41.67%', top: '54.17%' },
  statRight: { left: '75%', top: '29.17%' },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingBottom: 6,
  },
  profileContent: { gap: 14 },
  avatarGroup: { alignItems: 'center', gap: 8 },
  profileName: { fontFamily: sansBold, fontSize: 26, color: colors.green },
  counts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 10,
  },
  count: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    flexShrink: 1,
  },
  collectionsContent: { paddingTop: 16 },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    gap: 12,
  },
  edit: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.green,
    borderRadius: 20,
  },
  editText: { color: colors.white, fontFamily: sansBold, fontSize: 12 },
  journal: {
    minHeight: 30,
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
  photoAction: { alignItems: 'center', gap: 8 },
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
