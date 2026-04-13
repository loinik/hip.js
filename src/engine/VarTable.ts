// ─────────────────────────────────────────────────────────────────────────────
// VarTable.ts — non-boolean game variables
//
// Аналог Lua VarTable. Хранит числа, строки и null.
// Используется для счётчиков, состояний пазлов, имён сцен возврата и т.п.
//
// СИНТАКСИС:
//   VarTable.PAR_Tea_AmountLemon_VT           → number | string | null
//   VarTable.PAR_Tea_AmountLemon_VT = 3       → установить
//   VarTable.init([...])                      → инициализировать (→ null)
// ─────────────────────────────────────────────────────────────────────────────

type VTKey = string;
type VTValue = string | number | null;

class VarTableStore {
  private _data: Record<VTKey, VTValue> = {};

  /** Инициализировать набор переменных значением null */
  init(names: VTKey[]): void {
    names.forEach((name) => {
      if (!(name in this._data)) {
        this._data[name] = null;
      }
    });
  }

  /** Получить значение (неизвестная → null) */
  _get(name: VTKey): VTValue {
    if (__DEV__ && !(name in this._data)) {
      console.warn(`[VarTable] Неизвестная переменная: "${name}". Добавь её в VarTable.init()`);
    }
    return this._data[name] ?? null;
  }

  /** Установить значение */
  _set(name: VTKey, value: VTValue): void {
    this._data[name] = value;
  }

  /** Сброс всех переменных */
  _reset(): void {
    this._data = {};
  }

  /** Дамп для отладки */
  _dump(): Record<VTKey, VTValue> {
    return { ...this._data };
  }
}

const _store = new VarTableStore();

export const VarTable = new Proxy(_store, {
  get(target, prop: string) {
    if (prop in target) return (target as any)[prop].bind(target);
    return target._get(prop);
  },
  set(target, prop: string, value: VTValue) {
    if (prop in target) {
      (target as any)[prop] = value;
      return true;
    }
    target._set(prop, value);
    return true;
  },
}) as VarTableStore & Record<VTKey, VTValue>;
