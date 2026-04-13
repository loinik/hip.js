// ─────────────────────────────────────────────────────────────────────────────
// Inventory.ts — инвентарь игрока
//
// Аналог Lua-объекта Inventory.
//
// СИНТАКСИС:
//   Inventory.Add("INV_HANDLES")
//   Inventory.Remove("INV_HANDLES")
//   Inventory.Has("INV_HANDLES")    → boolean
//   Inventory.inHand                → текущий предмет «в руке» или null
//   Inventory.inHand = null         → убрать предмет из руки
// ─────────────────────────────────────────────────────────────────────────────

class InventoryStore {
  private _items = new Set<string>();

  /** Текущий предмет «в руке» (выбран для использования) */
  inHand: string | null = null;

  /** Добавить предмет в инвентарь */
  Add(item: string): void {
    this._items.add(item);
  }

  /** Убрать предмет из инвентаря (и из руки, если он там) */
  Remove(item: string): void {
    this._items.delete(item);
    if (this.inHand === item) {
      this.inHand = null;
    }
  }

  /** Есть ли предмет в инвентаре */
  Has(item: string): boolean {
    return this._items.has(item);
  }

  /** Все предметы */
  GetAll(): string[] {
    return [...this._items];
  }

  /** Сброс (новая игра) */
  _reset(): void {
    this._items.clear();
    this.inHand = null;
  }
}

export const Inventory = new InventoryStore();
