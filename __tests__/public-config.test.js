const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readPublicConfig } = require('../backend/client/publicConfig.build');

const projectUrl = 'https://example-essenza.supabase.co';
const publishableKey = 'sb_publishable_test_fixture';
let directory;

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'essenza-config-'));
});

afterEach(() => {
  const envFile = path.join(directory, '.env');
  if (fs.existsSync(envFile)) {
    fs.unlinkSync(envFile);
  }
  fs.rmdirSync(directory);
});

test('a fresh checkout supplies a development-only Supabase connection', () => {
  expect(readPublicConfig(directory, {})).toEqual({
    url: 'https://axoltjflgfycfathqued.supabase.co',
    publishableKey: expect.stringMatching(/^sb_publishable_[A-Za-z0-9_-]+$/),
    localHttp: false,
    developmentDefault: true,
  });
  expect(readPublicConfig(directory, { ESSENZA_LOCAL_DEMO: 'true' })).toEqual(
    {},
  );
});

test('a project override uses one complete source and rejects partial settings', () => {
  fs.writeFileSync(
    path.join(directory, '.env'),
    'ESSENZA_SUPABASE_URL=' +
      projectUrl +
      '\nESSENZA_SUPABASE_PUBLISHABLE_KEY=' +
      publishableKey +
      '\n',
  );
  expect(readPublicConfig(directory, {})).toEqual({
    url: projectUrl,
    publishableKey,
    localHttp: false,
  });
  expect(
    readPublicConfig(directory, {
      ESSENZA_SUPABASE_URL: 'https://different-project.supabase.co',
    }),
  ).toEqual({
    error: expect.stringMatching(/publishable key/),
  });
});
