// ─────────────────────────────────────────────────────────────────────────────
// GameLoop.ts — игровой цикл (requestAnimationFrame)
//
// Вызывает AR.tick(dt) каждый кадр для:
// • Оценки active-условий на всех нодах
// • Lifecycle callbacks (RunOnce, Run, OnDone)
// • Таймеров
// • Transformer-блендов
// ─────────────────────────────────────────────────────────────────────────────

import AR from './AssetRenderer';

let _lastTime = 0;
let _rafId: number | null = null;

function frame(timestamp: number): void {
  const dt = _lastTime === 0 ? 0.016 : (timestamp - _lastTime) / 1000;
  _lastTime = timestamp;
  AR.tick(dt);
  _rafId = requestAnimationFrame(frame);
}

/** Запустить игровой цикл */
export function startGameLoop(): void {
  if (_rafId !== null) return;
  _lastTime = 0;
  _rafId = requestAnimationFrame(frame);
}

/** Остановить игровой цикл */
export function stopGameLoop(): void {
  if (_rafId !== null) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }
}
