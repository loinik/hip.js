// ─────────────────────────────────────────────────────────────────────────────
// useAssetRenderer — React hook
// Подписывается на изменения AR и возвращает актуальный SceneState.
// Работает и на веб, и на мобильных платформах.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import AR, { SceneState } from './AssetRenderer';

export function useAssetRenderer(): SceneState {
  const [state, setState] = useState<SceneState>(() => AR.getState());

  useEffect(() => {
    // Сразу берём актуальный стейт (на случай, если сцена уже загружена)
    setState(AR.getState());

    // Подписываемся на все последующие изменения
    const unsubscribe = AR.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  return state;
}
