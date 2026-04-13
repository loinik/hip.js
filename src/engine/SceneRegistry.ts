// ─────────────────────────────────────────────────────────────────────────────
// SceneRegistry — реестр сцен
//
// ВАЖНО: все скрипты сцен должны экспортировать функцию по умолчанию:
//
//   export default function() {
//     AR.clear();
//     AR.Summary({ ... });
//     AR.Overlay({ ... });
//   }
//
// Это необходимо для корректной работы переходов в обе стороны:
// ES-модули кэшируются после первого импорта, поэтому повторный переход
// на сцену без export default не перевыполнит её код (глюки при возврате).
//
// КАК ДОБАВИТЬ НОВУЮ СЦЕНУ:
//   1. Создай файл assets/ciftree/MY_SCENE_SC.ts с export default function(){}
//   2. Добавь запись в SCENE_MAP ниже
// ─────────────────────────────────────────────────────────────────────────────

import AR from './AssetRenderer';

type SceneLoader = () => Promise<{ default?: () => void }>;

const SCENE_MAP: Record<string, SceneLoader> = {
  s0: () => import('../../assets/ciftree/s0'),
  TitleMenu_SC: () => import('../../assets/ciftree/TitleMenu_SC'),
  Badges_SC: () => import('../../assets/ciftree/Badges_SC'),
  UI_Extras_SC: () => import('../../assets/ciftree/UI_Extras_SC'),
  // Добавляй новые сцены здесь:
};

// ─────────────────────────────────────────────────────────────────────────────

let _currentScene: string | null = null;

/**
 * Загружает и запускает сцену по id.
 *
 * При первом вызове: импортирует модуль (кэшируется) → вызывает default().
 * При повторных вызовах: модуль уже в кэше → снова вызывает default().
 * Так сцена всегда стартует чисто, даже при возврате назад.
 */
export async function loadScene(id: string): Promise<void> {
  const loader = SCENE_MAP[id];

  if (!loader) {
    const known = Object.keys(SCENE_MAP).join(', ');
    throw new Error(`[SceneRegistry] Сцена "${id}" не найдена.\nЗарегистрированные: ${known}`);
  }

  // AR.clear() здесь НЕ вызываем — это обязанность самого скрипта сцены,
  // чтобы сцена могла решить, нужно ли ей чистить стейт (например, popup-сцены — нет).
  _currentScene = id;

  const mod = await loader();

  if (typeof mod.default === 'function') {
    mod.default();
  } else if (__DEV__) {
    console.warn(
      `[SceneRegistry] Сцена "${id}" не экспортирует default-функцию.\n` +
      `Добавь: export default function() { AR.clear(); ... }`
    );
  }
}

/** Текущая загруженная сцена */
export function getCurrentScene(): string | null {
  return _currentScene;
}

/** Все зарегистрированные id */
export function getSceneList(): string[] {
  return Object.keys(SCENE_MAP);
}