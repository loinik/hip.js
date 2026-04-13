// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — реестр ассетов
//
// Metro bundler (Expo) требует статических require() на этапе сборки.
// Поэтому все ассеты прописываются здесь вручную.
//
// СТРУКТУРА ПАПОК:
//   assets/
//     video/    — фоны сцен (Summary.bg)
//     ciftree/  — оверлеи, спрайты и прочие UI-элементы (Overlay.source)
//
// КАК ДОБАВИТЬ НОВЫЙ АССЕТ:
//   1. Положи файл в нужную папку
//   2. Добавь строку в соответствующий объект ниже
// ─────────────────────────────────────────────────────────────────────────────

// Тип источника изображения (совместим с Image source в React Native)
export type AssetSource = ReturnType<typeof require>;

// ── Фоны сцен (/assets/video/) ───────────────────────────────────────────────
// Ключ = значение поля bg в AR.Summary() — без расширения файла

const videoAssets: Record<string, AssetSource> = {
  GTH_MainMenu_BG: require('../../assets/video/GTH_MainMenu_BG.png'),
  UI_Difficulty_BG: require('../../assets/video/UI_Difficulty_BG.png'),
  toast_BG: require('../../assets/video/toast_BG.jpg'),
  // Добавляй новые фоны здесь:
  // EXAMPLE_BG: require('../../assets/video/EXAMPLE_BG.png'),
};

// ── UI-элементы и оверлеи (/assets/ciftree/) ─────────────────────────────────
// Ключ = значение поля source в AR.Overlay() — с расширением файла

const ciftreeAssets: Record<string, AssetSource> = {
  'UI_MainMenuTitleND_OVL': require('../../assets/ciftree/UI_MainMenuTitleND_OVL.png'),
  'UI_MainMenuTitleND_OVL_2x': require('../../assets/ciftree/UI_MainMenuTitleND_OVL_2x.png'),
  'GTH_MainMenuTitle_OVL': require('../../assets/ciftree/GTH_MainMenuTitle_OVL.png'),
  'UI_MainMenu_OVL': require('../../assets/ciftree/UI_MainMenu_OVL.png'),
  'UI_MainMenu_Rollover_OVL': require('../../assets/ciftree/UI_MainMenu_Rollover_OVL.png'),
  'UI_Difficulty_OVL': require('../../assets/ciftree/UI_Difficulty_OVL.png'),
  'UI_MainExtras_OVL': require('../../assets/ciftree/UI_MainExtras_OVL.png'),
  // Добавляй новые оверлеи здесь:
  // 'EXAMPLE_OVL.png': require('../../assets/ciftree/EXAMPLE_OVL.png'),
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Возвращает require-источник для фона сцены (Summary.bg).
 * Бросает ошибку в dev-режиме, если ассет не зарегистрирован.
 */
export function resolveVideoAsset(bg: string): AssetSource {
  const asset = videoAssets[bg];
  if (!asset) {
    if (__DEV__) {
      throw new Error(
        `[AssetRegistry] Фон "${bg}" не найден в videoAssets.\n` +
        `Добавь require('../../assets/video/${bg}.png') в AssetRegistry.ts`
      );
    }
    // В продакшене — fallback-заглушка (прозрачный 1x1 пиксель)
    return { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' };
  }
  return asset;
}

/** Возвращает ключ ассета с учётом resolution */
export function resolveCiftreeKey(source: string, resolution?: 1 | 2): string {
  if (resolution === 2) {
    // 'Name.png' → 'Name@2x.png'
    return source.replace(/(\.[^.]+)$/, '_2x$1');
  }
  return source;
}

/**
 * Возвращает require-источник для оверлея (Overlay.source).
 * Бросает ошибку в dev-режиме, если ассет не зарегистрирован.
 */
export function resolveCiftreeAsset(source: string): AssetSource {
  const asset = ciftreeAssets[source];
  if (!asset) {
    if (__DEV__) {
      throw new Error(
        `[AssetRegistry] Оверлей "${source}" не найден в ciftreeAssets.\n` +
        `Добавь require('../../assets/ciftree/${source}') в AssetRegistry.ts`
      );
    }
    return { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' };
  }
  return asset;
}
