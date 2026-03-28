// ─────────────────────────────────────────────────────────────────────────────
// Scene.ts — навигация между сценами
//
// Аналог Lua-объекта Scene. Используется из скриптов сцен.
//
// СИНТАКСИС (как в оригинале):
//   Scene.Change('TitleMenu_SC')                   — переход по id
//   Scene.Change(Scene.streamName, 'Badges_SC')    — переход внутри стрима
//   Scene.streamName                               — имя текущего стрима
//
// Стрим — это группа связанных сцен (например, 'Main', 'MainMenuPopup').
// При смене сцены внутри стрима стрим остаётся прежним.
// При Scene.Change('SomeScene') — переход без смены стрима.
// ─────────────────────────────────────────────────────────────────────────────

// Импортируем loadScene динамически внутри метода — это разрывает
// возможный circular import (SceneRegistry → Scene → SceneRegistry).
import { loadScene } from './SceneRegistry';

class SceneClass {
  private _streamName: string = 'Main';

  /** Имя текущего стрима (аналог Scene.streamName в Lua) */
  get streamName(): string {
    return this._streamName;
  }

  /**
   * Переход на другую сцену.
   *
   * Два варианта вызова:
   *   Scene.Change('TitleMenu_SC')
   *   Scene.Change(Scene.streamName, 'Badges_SC')
   *
   * Переход откладывается через setTimeout(0), чтобы текущий скрипт сцены
   * успел завершить выполнение до начала загрузки новой сцены.
   */
  Change(streamOrScene: string, sceneId?: string): void {
    let targetScene: string;

    if (sceneId !== undefined) {
      // Scene.Change(streamName, sceneId)
      this._streamName = streamOrScene;
      targetScene = sceneId;
    } else {
      // Scene.Change(sceneId) — стрим не меняем
      targetScene = streamOrScene;
    }

    // Откладываем: текущий модуль должен закончить до AR.clear() следующей сцены
    setTimeout(() => {
      loadScene(targetScene).catch((err) => {
        console.error(`[Scene] Ошибка перехода на "${targetScene}":`, err);
      });
    }, 0);
  }

  /** Принудительно задать имя стрима (используется в SceneRegistry) */
  _setStream(name: string): void {
    this._streamName = name;
  }
}

export const Scene = new SceneClass();