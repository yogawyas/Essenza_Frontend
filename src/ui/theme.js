import { StyleSheet } from 'react-native';
export const sans = 'DroidSans';
export const sansBold = 'DroidSans-Bold';
export const serif = 'DMSerifDisplay-Regular';
export const colors = {
  splash: '#192F24',
  green: '#163A2C',
  greenDark: '#102B20',
  sage: '#DDE6D9',
  gold: '#D7B93F',
  ivory: '#FAF3E1',
  canvas: '#F9F6ED',
  white: '#FFFFFF',
  ink: '#18261F',
  muted: '#687D6D',
  line: '#E2E5DA',
  danger: '#A83D38',
  lightGold: '#F0E6C7',
};
export const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  h1: {
    fontFamily: serif,
    fontSize: 34,
    lineHeight: 42,
    color: colors.ink,
  },
  h2: {
    fontFamily: serif,
    fontSize: 25,
    lineHeight: 33,
    color: colors.ink,
  },
  h3: {
    fontFamily: sansBold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
  },
  body: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
  },
  small: {
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  label: {
    fontFamily: sansBold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  input: {
    fontFamily: sans,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.ink,
    minHeight: 50,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
  error: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.danger,
  },
});
