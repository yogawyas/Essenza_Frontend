import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInitialState } from '../domain/models';
import { parseState, reduceState } from '../domain/state';
const KEY = '@essenza/b2c-v1';
export class LocalRepository {
  state = createInitialState();
  queue = Promise.resolve();
  constructor(storage = AsyncStorage) {
    this.storage = storage;
  }
  async load() {
    const raw = await this.storage.getItem(KEY);
    this.state = raw ? parseState(raw) : createInitialState();
    return this.state;
  }
  async dispatch(action) {
    // Commit to disk before publishing state; serial writes prevent rapid taps losing data.
    const operation = this.queue
      .catch(() => undefined)
      .then(async () => {
        const next = reduceState(this.state, action);
        await this.storage.setItem(KEY, JSON.stringify(next));
        this.state = next;
        return next;
      });
    this.queue = operation;
    return operation;
  }
}
