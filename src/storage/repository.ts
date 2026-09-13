import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, createInitialState } from '../domain/models';
import { Action, parseState, reduceState } from '../domain/state';

const KEY = '@essenza/b2c-v1';
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
}

export class LocalRepository {
  private state = createInitialState();
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private storage: KeyValueStorage = AsyncStorage) {}

  async load(): Promise<AppState> {
    const raw = await this.storage.getItem(KEY);
    this.state = raw ? parseState(raw) : createInitialState();
    return this.state;
  }

  async dispatch(action: Action): Promise<AppState> {
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
