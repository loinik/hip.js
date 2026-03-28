// ─────────────────────────────────────────────────────────────────────────────
// Flags.ts — глобальные флаги игры
//
// Аналог Lua-объекта Flags. Инициализируются один раз в s0_SC.ts,
// доступны из любой сцены через import.
//
// СИНТАКСИС (как в оригинале):
//   Flags.UI_Touch_FL           → boolean
//   Flags.UI_Touch_FL = true    → установить
//   Flags.init([...])           → инициализировать список флагов (→ false)
// ─────────────────────────────────────────────────────────────────────────────

type FlagKey = string;

class FlagsStore {
  private _data: Record<FlagKey, boolean> = {};

  /** Инициализировать набор флагов значением false */
  init(names: FlagKey[]): void {
    names.forEach((name) => {
      if (!(name in this._data)) {
        this._data[name] = false;
      }
    });
  }

  /** Получить значение флага (неизвестный → false) */
  _get(name: FlagKey): boolean {
    if (__DEV__ && !(name in this._data)) {
      console.warn(`[Flags] Неизвестный флаг: "${name}". Добавь его в Flags.init() в s0_SC.ts`);
    }
    return this._data[name] ?? false;
  }

  /** Установить значение флага */
  _set(name: FlagKey, value: boolean): void {
    this._data[name] = value;
  }

  /** Сброс всех флагов (используется при полном рестарте игры) */
  _reset(): void {
    this._data = {};
  }

  /** Дамп всех флагов для отладки */
  _dump(): Record<FlagKey, boolean> {
    return { ...this._data };
  }
}

// Прокси для прозрачного доступа: Flags.UI_Touch_FL = true
const _store = new FlagsStore();

export const Flags = new Proxy(_store, {
  get(target, prop: string) {
    // Внутренние методы класса (init, _get, _set, ...) — отдаём напрямую
    if (prop in target) return (target as any)[prop].bind(target);
    // Любое другое имя — это флаг
    return target._get(prop);
  },
  set(target, prop: string, value: boolean) {
    // Защита внутренних методов от перезаписи
    if (prop in target) {
      (target as any)[prop] = value;
      return true;
    }
    target._set(prop, value);
    return true;
  },
}) as FlagsStore & Record<FlagKey, boolean>;