// ─────────────────────────────────────────────────────────────────────────────
// AssetRenderer.ts — ядро движка
//
// AR — центральный синглтон, аналог C++ Assets Renderer из оригинала.
// Управляет всеми нодами сцены: визуальными (Overlay, Movie, Button, FillRect)
// и логическими (Timer, Override, Sound, Transformer, Sink).
//
// Каждая нода поддерживает:
// • active-паттерн (boolean | function → реактивная активация)
// • .done (завершение ноды)
// • Lifecycle: RunOnce → Run (каждый кадр) → OnDone
// • Messaging (Send/Receive через алиасы)
//
// Игровой цикл (GameLoop.ts) вызывает AR.tick(dt) каждый кадр.
// React-рендерер подписывается через subscribe() и рисует визуальный стейт.
// ─────────────────────────────────────────────────────────────────────────────

import { Sound } from './SoundManager';

// ── Примитивы ───────────────────────────────────────────────────────────────

export type RectData = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/** Аналог Lua Rect:New(left, top, right, bottom) */
export function Rect(x1: number, y1: number, x2: number, y2: number): RectData {
  return { x1, y1, x2, y2 };
}

export type PointData = { x: number; y: number };

/** Аналог Lua Point:New(x, y) */
export function Point(x: number, y: number): PointData {
  return { x, y };
}

export type ColorData = { a: number; r: number; g: number; b: number };

/** Аналог Lua Color:New(alpha, red, green, blue) — alpha первым */
export function Color(a: number, r: number, g: number, b: number): ColorData {
  return { a, r, g, b };
}

// ── Viewport ────────────────────────────────────────────────────────────────

export const Viewport = {
  uiSize: 'uiSize' as const,
  size: {
    width: 1024,
    height: 768,
    centerV: { x: 512, y: 384 } as PointData,
  },
};

export type ViewportSize = typeof Viewport.uiSize;

// ── Active ──────────────────────────────────────────────────────────────────

export type ActiveProp = boolean | ((self: any) => boolean);

// ── Типы конфигов ───────────────────────────────────────────────────────────

export type SummaryConfig = {
  id: string;
  env: string;
  bg: string;
};

export type OverlayConfig = {
  id: string;
  ovl: string;
  source: RectData | ViewportSize;
  onScreen: RectData | ViewportSize;
  visible?: boolean;
  z?: number;
  resolution?: 1 | 2;
  // Lifecycle
  active?: ActiveProp;
  localAlpha?: number;
  alias?: string;
  RunOnce?: (self: any) => void;
  Run?: (self: any) => void;
  OnDone?: (self: any) => void;
  // Internal runtime
  _nodeType?: string;
  _isActive?: boolean;
  done?: boolean;
};

export type MovieConfig = {
  id: string;
  movie: string;
  source: RectData | ViewportSize;
  onScreen: RectData | ViewportSize;
  loop?: boolean;
  pauseOnLastFrame?: boolean;
  z?: number;
  // Lifecycle
  active?: ActiveProp;
  localAlpha?: number;
  alias?: string;
  OnDone?: (self: any) => void;
  // Internal runtime
  _nodeType?: string;
  _isActive?: boolean;
  done?: boolean;
  frame?: number;
  /** Вызывается рендерером когда видео закончилось */
  _markDone?: () => void;
};

export type HotspotConfig = {
  id?: string;
  onScreen: RectData;
  cursor?: string;
  ovl?: string;
  source?: RectData;
  scene?: string;
  frame?: number;
  tooltip?: string;
  active?: ActiveProp;
  OnDone?: (self: any) => void;
  // Runtime
  done?: boolean;
  _isActive?: boolean;
  _nodeType?: string;
  Reset?: () => void;
  Send?: (alias: string, action: string, ...args: any[]) => void;
};

export type ButtonConfig = {
  id: string;
  hs: HotspotConfig;
  overOvl?: OverlayConfig;
  downOvl?: OverlayConfig;
  baseOvl?: OverlayConfig;
  OnDown?: () => void;
  OnUp?: () => void;
  z?: number;
  active?: ActiveProp;
  alias?: string;
  // Internal runtime
  _nodeType?: string;
  _isActive?: boolean;
};

export type FillRectConfig = {
  id: string;
  r: number;
  g: number;
  b: number;
  a: number;
  onScreen: RectData | ViewportSize;
  blockInput?: boolean;
  z?: number;
  active?: ActiveProp;
  // Internal runtime
  _nodeType?: string;
  _isActive?: boolean;
};

export type TimerConfig = {
  id: string;
  duration: number;
  active?: ActiveProp;
  alias?: string;
  RunOnce?: (self: any) => void;
  OnDone?: (self: any) => void;
  // Runtime
  _nodeType?: string;
  _isActive?: boolean;
  _wasActive?: boolean;
  _ranOnce?: boolean;
  _elapsed?: number;
  done?: boolean;
  Done?: () => void;
  Restart?: () => void;
  Reset?: () => void;
  Send?: (alias: string, action: string, ...args: any[]) => void;
};

export type OverrideConfig = {
  id: string;
  active?: ActiveProp;
  alias?: string;
  z?: number;
  RunOnce?: (self: any) => void;
  Run?: (self: any) => void;
  OnDone?: (self: any) => void;
  OnKeyDown?: (self: any, key: string) => boolean | void;
  Render?: (self: any) => void;
  OnExitRequest?: () => void;
  Receive?: (self: any, sender: any, action: string, ...args: any[]) => void;
  // Runtime
  _nodeType?: string;
  _isActive?: boolean;
  _wasActive?: boolean;
  _ranOnce?: boolean;
  done?: boolean;
  Done?: () => void;
  Restart?: () => void;
  Reset?: () => void;
  Send?: (alias: string, action: string, ...args: any[]) => void;
  RegisterAlias?: (alias: string) => boolean;
};

export type SoundConfig = {
  id: string;
  sounds: string | string[];
  channel?: string;
  volume?: number;
  loop?: boolean;
  duration?: number;
  active?: ActiveProp;
  alias?: string;
  RunOnce?: (self: any) => void;
  OnDone?: (self: any) => void;
  // Runtime
  _nodeType?: string;
  _isActive?: boolean;
  _wasActive?: boolean;
  _ranOnce?: boolean;
  _elapsed?: number;
  done?: boolean;
  Done?: () => void;
  Restart?: () => void;
  Reset?: () => void;
  Send?: (alias: string, action: string, ...args: any[]) => void;
};

// ── Transformer ─────────────────────────────────────────────────────────────

type BlendParam = {
  value: number;
  target?: number;
  duration?: number;
  elapsed?: number;
  from?: number;
};

export type TransformerNode = {
  id: string;
  z?: number;
  _nodeType: 'transformer';
  _attachedNodes: any[];
  _params: Map<string, BlendParam>;
  _isActive: boolean;
  done: boolean;
  Attach: (...nodes: any[]) => void;
  PushAlpha: (name: string, value: number) => void;
  Blend: (name: string, duration: number, target: number) => void;
};

// ── Scene State (то, что видит React) ───────────────────────────────────────

export type SceneState = {
  summary: SummaryConfig | null;
  overlays: OverlayConfig[];
  movies: MovieConfig[];
  buttons: ButtonConfig[];
  fillRects: FillRectConfig[];
};

type Listener = (state: SceneState) => void;

// ─────────────────────────────────────────────────────────────────────────────
// AssetRendererClass
// ─────────────────────────────────────────────────────────────────────────────

class AssetRendererClass {
  // ── Visual state (for React) ──────────────────────────────────────────────
  private _state: SceneState = {
    summary: null,
    overlays: [],
    movies: [],
    buttons: [],
    fillRects: [],
  };

  private _listeners = new Set<Listener>();
  private _seq = 0;

  // ── Node registry (all nodes, including non-visual) ───────────────────────
  private _allNodes = new Map<string, any>();
  private _aliases = new Map<string, any>();

  constructor() {
    Sound._bind(
      (ch) => this._stopSoundChannel(ch),
      () => this._stopAllSounds(),
    );
  }

  // ── ID ────────────────────────────────────────────────────────────────────

  private nextId(prefix: string): string {
    return `${prefix}_${++this._seq}`;
  }

  // ── Подписка (React) ──────────────────────────────────────────────────────

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

  // ── Очистка (при смене сцены) ─────────────────────────────────────────────

  clear(): void {
    this._state = { summary: null, overlays: [], movies: [], buttons: [], fillRects: [] };
    this._allNodes.clear();
    this._aliases.clear();
    this.emit();
  }

  // ── Оценка active ────────────────────────────────────────────────────────

  private _evaluateActive(node: any): boolean {
    const active = node.active;
    if (typeof active === 'function') {
      try {
        return !!active(node);
      } catch {
        return false;
      }
    }
    return active !== false;
  }

  // ── Создание базовой ноды ─────────────────────────────────────────────────

  private _createNodeBase(type: string, id: string, config: any): any {
    const node: any = { ...config, id, _nodeType: type };

    node._isActive = false;
    node._wasActive = false;
    node._ranOnce = false;
    node.done = node.done ?? false;
    node.localAlpha = node.localAlpha ?? 1;
    node._elapsed = 0;

    node.Done = () => {
      if (!node.done) {
        node.done = true;
        node.OnDone?.(node);
      }
    };

    node.Restart = () => {
      node.done = false;
      node._ranOnce = false;
      node._wasActive = false;
      node._elapsed = 0;
    };

    node.Reset = () => {
      node.done = false;
      node._ranOnce = false;
    };

    node.Send = (alias: string, action: string, ...args: any[]) => {
      this._sendMessage(alias, action, node, ...args);
    };

    node.RegisterAlias = (alias: string): boolean => {
      return this._registerAlias(alias, node);
    };

    if (config.alias) {
      this._registerAlias(config.alias, node);
    }

    this._allNodes.set(id, node);

    // Initial active (static only; functions deferred to game loop)
    if (typeof config.active !== 'function') {
      node._isActive = config.active !== false;
    }

    return node;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // FACTORY METHODS
  // ═════════════════════════════════════════════════════════════════════════════

  Summary(config: Omit<SummaryConfig, 'id'> & { id?: string }): SummaryConfig {
    const full: SummaryConfig = { id: 'sum', ...config };
    this._state = { ...this._state, summary: full };
    this.emit();
    return full;
  }

  Overlay(config: Omit<OverlayConfig, 'id'> & { id?: string }): OverlayConfig {
    const id = config.id || this.nextId('ovl');
    const node = this._createNodeBase('overlay', id, config);

    const idx = this._state.overlays.findIndex((o) => o.id === node.id);
    const overlays = [...this._state.overlays];
    if (idx >= 0) overlays[idx] = node;
    else overlays.push(node);
    this._state = { ...this._state, overlays };
    this.emit();
    return node;
  }

  Movie(config: Omit<MovieConfig, 'id'> & { id?: string }): MovieConfig {
    const id = config.id || this.nextId('movie');
    const node = this._createNodeBase('movie', id, config);

    node._markDone = () => {
      if (!node.done) {
        node.done = true;
        node.OnDone?.(node);
      }
    };

    const idx = this._state.movies.findIndex((m) => m.id === node.id);
    const movies = [...this._state.movies];
    if (idx >= 0) movies[idx] = node;
    else movies.push(node);
    this._state = { ...this._state, movies };
    this.emit();
    return node;
  }

  Hotspot(config: HotspotConfig): HotspotConfig {
    const id = config.id || this.nextId('hs');
    const hs: any = { ...config, id, _nodeType: 'hotspot', done: false };

    hs.Reset = () => { hs.done = false; };
    hs.Send = (alias: string, action: string, ...args: any[]) => {
      this._sendMessage(alias, action, hs, ...args);
    };

    return hs;
  }

  Button(config: Omit<ButtonConfig, 'id'> & { id?: string }): ButtonConfig {
    const id = config.id || this.nextId('btn');
    const node = this._createNodeBase('button', id, config);

    const idx = this._state.buttons.findIndex((b) => b.id === node.id);
    const buttons = [...this._state.buttons];
    if (idx >= 0) buttons[idx] = node;
    else buttons.push(node);
    this._state = { ...this._state, buttons };
    this.emit();
    return node;
  }

  FillRect(config: Omit<FillRectConfig, 'id'> & { id?: string }): FillRectConfig {
    const id = config.id || this.nextId('fill');
    const node = this._createNodeBase('fillRect', id, config);

    const idx = this._state.fillRects.findIndex((f) => f.id === node.id);
    const fillRects = [...this._state.fillRects];
    if (idx >= 0) fillRects[idx] = node;
    else fillRects.push(node);
    this._state = { ...this._state, fillRects };
    this.emit();
    return node;
  }

  Timer(config: {
    duration: number; id?: string; active?: ActiveProp; alias?: string;
    RunOnce?: (self: any) => void; OnDone?: (self: any) => void;
  }): TimerConfig {
    const id = config.id || this.nextId('timer');
    const node = this._createNodeBase('timer', id, config);
    node._elapsed = 0;
    return node;
  }

  Override(config: {
    id?: string; active?: ActiveProp; alias?: string; z?: number;
    RunOnce?: (self: any) => void; Run?: (self: any) => void;
    OnDone?: (self: any) => void;
    OnKeyDown?: (self: any, key: string) => boolean | void;
    Render?: (self: any) => void;
    OnExitRequest?: () => void;
    Receive?: (self: any, sender: any, action: string, ...args: any[]) => void;
  }): OverrideConfig {
    const id = config.id || this.nextId('ovr');
    const node = this._createNodeBase('override', id, config);
    return node;
  }

  Sound(config: {
    sounds: string | string[]; id?: string; channel?: string;
    volume?: number; loop?: boolean; duration?: number; active?: ActiveProp;
    alias?: string; RunOnce?: (self: any) => void; OnDone?: (self: any) => void;
  }): SoundConfig {
    const id = config.id || this.nextId('snd');
    const node = this._createNodeBase('sound', id, config);
    node._elapsed = 0;
    if (typeof node.sounds === 'string') {
      node.sounds = [node.sounds];
    }
    return node;
  }

  Transformer(config: { id?: string; z?: number } = {}): TransformerNode {
    const id = config.id || this.nextId('trns');
    const node: TransformerNode = {
      id,
      z: config.z,
      _nodeType: 'transformer',
      _attachedNodes: [],
      _params: new Map(),
      _isActive: true,
      done: false,
      Attach: (...nodes: any[]) => { node._attachedNodes.push(...nodes); },
      PushAlpha: (name: string, value: number) => {
        node._params.set(name, { value });
      },
      Blend: (name: string, duration: number, target: number) => {
        const param = node._params.get(name);
        if (param) {
          param.from = param.value;
          param.target = target;
          param.duration = duration;
          param.elapsed = 0;
        } else {
          node._params.set(name, { value: 1, from: 1, target, duration, elapsed: 0 });
        }
      },
    };
    this._allNodes.set(id, node);
    return node;
  }

  Sink(config: {
    id?: string; cursor?: string; onScreen?: RectData | ViewportSize;
    z?: number; active?: ActiveProp;
  }): FillRectConfig {
    return this.FillRect({
      id: config.id,
      r: 0, g: 0, b: 0, a: 0,
      onScreen: config.onScreen ?? 'uiSize',
      blockInput: true,
      z: config.z ?? -10,
      active: config.active,
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // UPDATE / REMOVE
  // ═════════════════════════════════════════════════════════════════════════════

  updateOverlay(id: string, patch: Partial<Omit<OverlayConfig, 'id'>>): void {
    const idx = this._state.overlays.findIndex((o) => o.id === id);
    if (idx < 0) return;
    const overlays = [...this._state.overlays];
    overlays[idx] = { ...overlays[idx], ...patch };
    const node = this._allNodes.get(id);
    if (node) Object.assign(node, patch);
    this._state = { ...this._state, overlays };
    this.emit();
  }

  removeOverlay(id: string): void {
    this._state = { ...this._state, overlays: this._state.overlays.filter((o) => o.id !== id) };
    this._allNodes.delete(id);
    this.emit();
  }

  removeButton(id: string): void {
    this._state = { ...this._state, buttons: this._state.buttons.filter((b) => b.id !== id) };
    this._allNodes.delete(id);
    this.emit();
  }

  removeFillRect(id: string): void {
    this._state = { ...this._state, fillRects: this._state.fillRects.filter((f) => f.id !== id) };
    this._allNodes.delete(id);
    this.emit();
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // GAME LOOP
  // ═════════════════════════════════════════════════════════════════════════════

  tick(dt: number): void {
    let dirty = false;

    for (const node of this._allNodes.values()) {
      const type = node._nodeType as string;

      // Evaluate active
      const wasActive = node._isActive;
      const isActive = this._evaluateActive(node);

      if (isActive !== wasActive) {
        node._isActive = isActive;
        if (type === 'overlay' || type === 'movie' || type === 'button' || type === 'fillRect') {
          dirty = true;
        }
      }

      if (!isActive) {
        node._wasActive = false;
        continue;
      }

      // Lifecycle: RunOnce
      if (!node._ranOnce && !node.done) {
        node._ranOnce = true;
        node.RunOnce?.(node);
      }

      // Lifecycle: Run
      if (!node.done) {
        node.Run?.(node);
      }

      // Timer
      if (type === 'timer' && !node.done) {
        node._elapsed = (node._elapsed || 0) + dt;
        if (node._elapsed >= node.duration) {
          node.Done();
        }
      }

      // Sound (virtual)
      if (type === 'sound' && !node.done && !node.loop) {
        const dur = node.duration ?? 0;
        if (dur > 0) {
          node._elapsed = (node._elapsed || 0) + dt;
          if (node._elapsed >= dur) {
            node.Done();
          }
        } else if (node._ranOnce) {
          node.Done();
        }
      }

      // Transformer
      if (type === 'transformer') {
        dirty = this._tickTransformer(node, dt) || dirty;
      }

      node._wasActive = true;
    }

    if (dirty) {
      this.emit();
    }
  }

  /** Немедленная оценка всех нод (вызывается SceneRegistry после загрузки сцены) */
  _evaluateAll(): void {
    let dirty = false;
    for (const node of this._allNodes.values()) {
      const wasActive = node._isActive;
      node._isActive = this._evaluateActive(node);
      if (node._isActive !== wasActive) {
        const t = node._nodeType;
        if (t === 'overlay' || t === 'movie' || t === 'button' || t === 'fillRect') {
          dirty = true;
        }
      }
    }
    if (dirty) this.emit();
  }

  private _tickTransformer(trns: TransformerNode, dt: number): boolean {
    let changed = false;
    for (const param of trns._params.values()) {
      if (param.target !== undefined && param.from !== undefined && param.duration) {
        param.elapsed = (param.elapsed || 0) + dt;
        const t = Math.min(param.elapsed / param.duration, 1);
        param.value = param.from + (param.target - param.from) * t;
        changed = true;
        if (t >= 1) {
          param.target = undefined;
          param.from = undefined;
          param.duration = undefined;
          param.elapsed = undefined;
        }
      }
    }
    if (changed && trns._attachedNodes.length > 0) {
      let alpha = 1;
      for (const param of trns._params.values()) {
        alpha *= param.value;
      }
      for (const attached of trns._attachedNodes) {
        attached.localAlpha = Math.max(0, Math.min(1, alpha));
      }
    }
    return changed;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // MESSAGING
  // ═════════════════════════════════════════════════════════════════════════════

  private _registerAlias(alias: string, node: any): boolean {
    if (__DEV__ && this._aliases.has(alias)) {
      console.warn('[AR] Алиас "' + alias + '" перезаписан');
    }
    this._aliases.set(alias, node);
    return true;
  }

  private _sendMessage(alias: string, action: string, sender: any, ...args: any[]): void {
    const target = this._aliases.get(alias);
    if (!target) {
      if (__DEV__) console.warn('[AR] Алиас "' + alias + '" не найден');
      return;
    }
    target.Receive?.(target, sender, action, ...args);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // KEYBOARD
  // ═════════════════════════════════════════════════════════════════════════════

  dispatchKeyDown(key: string): boolean {
    for (const node of this._allNodes.values()) {
      if (node._nodeType === 'override' && node._isActive && node.OnKeyDown) {
        const consumed = node.OnKeyDown(node, key);
        if (consumed) return true;
      }
    }
    return false;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // SOUND CHANNELS
  // ═════════════════════════════════════════════════════════════════════════════

  private _stopSoundChannel(channel: string): void {
    for (const node of this._allNodes.values()) {
      if (node._nodeType === 'sound' && node.channel === channel && !node.done) {
        node.done = true;
      }
    }
  }

  private _stopAllSounds(): void {
    for (const node of this._allNodes.values()) {
      if (node._nodeType === 'sound' && !node.done) {
        node.done = true;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

const AR = new AssetRendererClass();
export default AR;
