const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { parseEnv } = require('node:util');
const developmentConfig = require('./supabaseDevelopment.json');

function readPublicConfig(projectRoot, environment = process.env) {
  let fileEnv = {};
  try {
    fileEnv = parseEnv(readFileSync(join(projectRoot, '.env'), 'utf8'));
  } catch (cause) {
    if (cause.code !== 'ENOENT') {
      return { error: 'Could not read the Essenza environment configuration.' };
    }
  }

  if ((environment.ESSENZA_LOCAL_DEMO ?? fileEnv.ESSENZA_LOCAL_DEMO) === 'true') {
    return {};
  }
  const useEnvironment =
    environment.ESSENZA_SUPABASE_URL !== undefined ||
    environment.ESSENZA_SUPABASE_PUBLISHABLE_KEY !== undefined;
  const settings = useEnvironment ? environment : fileEnv;
  const url = (settings.ESSENZA_SUPABASE_URL ?? '').trim();
  const key = (settings.ESSENZA_SUPABASE_PUBLISHABLE_KEY ?? '').trim();
  if (!url && !key) {
    return { ...developmentConfig, localHttp: false, developmentDefault: true };
  }
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    return {
      error: 'Set the Supabase publishable key (sb_publishable_…) in .env.',
    };
  }

  try {
    const endpoint = new URL(url);
    const localHttp =
      endpoint.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]', '10.0.2.2'].includes(
        endpoint.hostname,
      );
    if (
      (endpoint.protocol === 'https:' || localHttp) &&
      !endpoint.username &&
      !endpoint.password &&
      endpoint.pathname === '/' &&
      !endpoint.search &&
      !endpoint.hash
    ) {
      return { url: endpoint.origin, publishableKey: key, localHttp };
    }
  } catch {
    // Report invalid configuration without including its contents.
  }
  return { error: 'Set a valid Supabase project URL in .env.' };
}

module.exports = { readPublicConfig };
