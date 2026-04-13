// ─────────────────────────────────────────────────────────────────────────────
// Brain.ts — persistent game-progress booleans
//
// Аналог Lua-объекта Brain. Хранит прогресс игрока, сохраняется between
// сессиями (в отличие от Flags, которые — transient per-scene state).
//
// СИНТАКСИС (как в оригинале):
//   Brain.Met_WT_BR                → boolean
//   Brain.Met_WT_BR = true         → установить
//   Brain.init([...])              → инициализировать список переменных (→ false)
// ─────────────────────────────────────────────────────────────────────────────

type BrainKey = string;

class BrainStore {
  private _data: Record<BrainKey, boolean> = {};

  /** Инициализировать набор переменных мозга значением false */
  init(names: BrainKey[]): void {
    names.forEach((name) => {
      if (!(name in this._data)) {
        this._data[name] = false;
      }
    });
  }

  /** Получить значение (неизвестная → false) */
  _get(name: BrainKey): boolean {
    if (__DEV__ && !(name in this._data)) {
      console.warn(`[Brain] Неизвестная переменная: "${name}". Добавь её в Brain.init()`);
    }
    return this._data[name] ?? false;
  }

  /** Установить значение */
  _set(name: BrainKey, value: boolean): void {
    this._data[name] = value;
  }

  /** Сброс всех переменных (новая игра) */
  _reset(): void {
    this._data = {};
  }

  /** Дамп для отладки */
  _dump(): Record<BrainKey, boolean> {
    return { ...this._data };
  }
}

const _store = new BrainStore();

export const Brain = new Proxy(_store, {
  get(target, prop: string) {
    if (prop in target) return (target as any)[prop].bind(target);
    return target._get(prop);
  },
  set(target, prop: string, value: boolean) {
    if (prop in target) {
      (target as any)[prop] = value;
      return true;
    }
    target._set(prop, value);
    return true;
  },
}) as BrainStore & Record<BrainKey, boolean>;
