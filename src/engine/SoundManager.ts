// ─────────────────────────────────────────────────────────────────────────────
// SoundManager.ts — глобальное управление звуком
//
// Аналог Lua-объекта Sound (глобальный, не AR:Sound).
//
// СИНТАКСИС:
//   Sound.Stop("FX1")   — остановить все звуки на канале
//   Sound.StopAll()     — остановить всё
// ─────────────────────────────────────────────────────────────────────────────

class SoundManagerClass {
  private _stopChannelFn: ((channel: string) => void) | null = null;
  private _stopAllFn: (() => void) | null = null;

  /** Вызывается из AR при инициализации — связывает менеджер с движком */
  _bind(
    stopChannel: (channel: string) => void,
    stopAll: () => void,
  ): void {
    this._stopChannelFn = stopChannel;
    this._stopAllFn = stopAll;
  }

  /** Остановить все звуки на канале */
  Stop(channel: string): void {
    this._stopChannelFn?.(channel);
  }

  /** Остановить все звуки */
  StopAll(): void {
    this._stopAllFn?.();
  }
}

export const Sound = new SoundManagerClass();
