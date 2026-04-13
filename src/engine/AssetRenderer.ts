// ─────────────────────────────────────────────────────────────────────────────
// AssetRenderer — ядро движка
// ─────────────────────────────────────────────────────────────────────────────

// ── Rect ─────────────────────────────────────────────────────────────────────
// Прямоугольник «от пикселя до пикселя» (как в Lua Rect:New).
// x1,y1 — левый верхний угол; x2,y2 — правый нижний.
// Ширина = x2 - x1,  высота = y2 - y1.

export type RectData = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/** Аналог Lua Rect:New(x1, y1, x2, y2) */
export function Rect(x1: number, y1: number, x2: number, y2: number): RectData {
  return { x1, y1, x2, y2 };
}

// ── Viewport ──────────────────────────────────────────────────────────────────
// Viewport.uiSize — маркер «весь игровой экран» (1024×768).
// SceneRenderer подставляет реальный Rect автоматически.

export const Viewport = {
  uiSize: 'uiSize' as const,
};

export type ViewportSize = typeof Viewport.uiSize;

// ─────────────────────────────────────────────────────────────────────────────
// Конфиги элементов
// ─────────────────────────────────────────────────────────────────────────────

export type SummaryConfig = {
  id: string;
  env: string;
  /** Имя файла фона без расширения → assets/video/ */
  bg: string;
};

export type OverlayConfig = {
  id: string;
  /** Имя файла с расширением → assets/ciftree/ */
  ovl: string;
  /**
   * Область из исходного файла (canvas-кроп), в логических пикселях.
   * Rect:New(0, 0, 808, 366) = вся область шириной 808 и высотой 366.
   */
  source: RectData | ViewportSize;
  /**
   * Куда поместить на экране.
   * Rect:New(108, 83, 916, 449) = от x=108 до x=916, от y=83 до y=449.
   */
  onScreen: RectData | ViewportSize;
  /** По умолчанию true */
  visible?: boolean;
  /** Z-порядок. По умолчанию 0 */
  z?: number;
  /** 2 = использовать _2x файл. По умолчанию 1 */
  resolution?: 1 | 2;
};

export type MovieConfig = {
  id: string;
  /** Имя видеофайла без расширения → assets/video/ */
  movie: string;
  source: RectData | ViewportSize;
  onScreen: RectData | ViewportSize;
  loop?: boolean;
  /** Остановиться на последнем кадре */
  pauseOnLastFrame?: boolean;
  z?: number;
};

export type HotspotConfig = {
  onScreen: RectData;
  cursor?: string;
  /** Опциональный спрайт хотспота */
  ovl?: string;
  source?: RectData;
};

export type ButtonConfig = {
  id: string;
  hs: HotspotConfig;
  /**
   * Rollover-оверлей (hover на вебе).
   * На мобильном: показывается при нажатии ТОЛЬКО если downOvl не задан.
   */
  overOvl?: OverlayConfig;
  /**
   * Оверлей нажатого состояния (press/down).
   * Если задан — на мобильном overOvl игнорируется, показывается downOvl.
   * На вебе downOvl показывается поверх overOvl при mousedown.
   */
  downOvl?: OverlayConfig;
  /**
   * Базовый спрайт кнопки — всегда виден, независимо от состояния.
   * Аналог baseOvl в оригинальном движке.
   */
  baseOvl?: OverlayConfig;
  /** Срабатывает при нажатии (onPressIn / mousedown) */
  OnDown?: () => void;
  /** Срабатывает при отпускании (onPressOut / mouseup) */
  OnUp?: () => void;
  z?: number;
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Закрашенный прямоугольник — аналог AR:Override { Render = DrawRect } в оригинале.
 * Используется для полупрозрачных затемнений, попапов и т.п.
 * Цвет: r,g,b,a — каждый 0..255.
 */
export type FillRectConfig = {
  id: string;
  r: number;
  g: number;
  b: number;
  /** Прозрачность 0..255 (255 = полностью непрозрачный) */
  a: number;
  onScreen: RectData | ViewportSize;
  /** Блокировать тапы/клики под собой */
  blockInput?: boolean;
  z?: number;
};

// ─────────────────────────────────────────────────────────────────────────────

export type SceneState = {
  summary: SummaryConfig | null;
  overlays: OverlayConfig[];
  movies: MovieConfig[];
  buttons: ButtonConfig[];
  fillRects: FillRectConfig[];
};

type Listener = (state: SceneState) => void;

// ─────────────────────────────────────────────────────────────────────────────

class AssetRendererClass {
  private _state: SceneState = {
    summary: null,
    overlays: [],
    movies: [],
    buttons: [],
    fillRects: [],
  };
  private _listeners = new Set<Listener>();
  private _seq = 0;

  private nextId(prefix: string): string {
    return `${prefix}_${++this._seq}`;
  }

  subscribe(fn: Listener): () => void {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  getState(): SceneState {
    return {
      ...this._state,
      overlays: [...this._state.overlays],
      movies: [...this._state.movies],
      buttons: [...this._state.buttons],
      fillRects: [...this._state.fillRects],
    };
  }

  private emit(): void {
    const snap = this.getState();
    this._listeners.forEach((fn) => fn(snap));
  }

  clear(): void {
    this._state = { summary: null, overlays: [], movies: [], buttons: [], fillRects: [] };
    this.emit();
  }

  Summary(config: Omit<SummaryConfig, 'id'> & { id?: string }): SummaryConfig {
    const full: SummaryConfig = { id: 'sum', ...config };
    this._state = { ...this._state, summary: full };
    this.emit();
    return full;
  }

  Overlay(config: Omit<OverlayConfig, 'id'> & { id?: string }): OverlayConfig {
    const full: OverlayConfig = {
      id: this.nextId('ovl'),
      ...config,
    };
    const idx = this._state.overlays.findIndex((o) => o.id === full.id);
    const overlays = [...this._state.overlays];
    if (idx >= 0) overlays[idx] = full;
    else overlays.push(full);
    this._state = { ...this._state, overlays };
    this.emit();
    return full;
  }

  Movie(config: Omit<MovieConfig, 'id'> & { id?: string }): MovieConfig {
    const full: MovieConfig = {
      id: `movie_${Date.now()}`,
      ...config,
    };
    const idx = this._state.movies.findIndex((m) => m.id === full.id);
    const movies = [...this._state.movies];
    if (idx >= 0) movies[idx] = full;
    else movies.push(full);
    this._state = { ...this._state, movies };
    this.emit();
    return full;
  }

  /**
   * Хотспот как standalone-объект.
   * Возвращает конфиг как есть — Button встраивает его через hs:.
   */
  Hotspot(config: HotspotConfig): HotspotConfig {
    return config;
  }

  Button(config: Omit<ButtonConfig, 'id'> & { id?: string }): ButtonConfig {
    const full: ButtonConfig = {
      id: this.nextId('btn'),
      // Заглушка OnDown: Alert до тех пор, пока не прописан реальный обработчик
      OnDown: () => {
        // React Native Alert — работает и на вебе (через window.alert), и на мобильном
        // if (typeof alert !== 'undefined') alert(`[AR] Button pressed: ${full?.id ?? 'btn'}`);
      },
      ...config,
    };
    const idx = this._state.buttons.findIndex((b) => b.id === full.id);
    const buttons = [...this._state.buttons];
    if (idx >= 0) buttons[idx] = full;
    else buttons.push(full);
    this._state = { ...this._state, buttons };
    this.emit();
    return full;
  }

  updateOverlay(id: string, patch: Partial<Omit<OverlayConfig, 'id'>>): void {
    const idx = this._state.overlays.findIndex((o) => o.id === id);
    if (idx < 0) return;
    const overlays = [...this._state.overlays];
    overlays[idx] = { ...overlays[idx], ...patch };
    this._state = { ...this._state, overlays };
    this.emit();
  }

  removeOverlay(id: string): void {
    this._state = {
      ...this._state,
      overlays: this._state.overlays.filter((o) => o.id !== id),
    };
    this.emit();
  }

  /**
   * Закрашенный прямоугольник (затемнение, оверлей попапа).
   * Аналог AR:Override { Render = function() this:DrawRect(rect, color) }
   */
  FillRect(config: Omit<FillRectConfig, 'id'> & { id?: string }): FillRectConfig {
    const full: FillRectConfig = { id: this.nextId('fill'), ...config };
    const idx = this._state.fillRects.findIndex((f) => f.id === full.id);
    const fillRects = [...this._state.fillRects];
    if (idx >= 0) fillRects[idx] = full;
    else fillRects.push(full);
    this._state = { ...this._state, fillRects };
    this.emit();
    return full;
  }
}

const AR = new AssetRendererClass();
export default AR;