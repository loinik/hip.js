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
  private _previousScene: string | null = null;

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
   */
  Change(streamOrScene: string, sceneId?: string): void {
    let targetScene: string;

    if (sceneId !== undefined) {
      this._streamName = streamOrScene;
      targetScene = sceneId;
    } else {
      targetScene = streamOrScene;
    }

    setTimeout(() => {
      loadScene(targetScene).catch((err) => {
        console.error(`[Scene] Ошибка перехода на "${targetScene}":`, err);
      });
    }, 0);
  }

  /**
   * Открыть попап-сцену поверх текущей (без AR.clear()).
   * Аналог Scene:BeginStream в оригинале.
   *
   * Сохраняет текущую сцену — она перезагрузится при EndStream.
   * Скрипт попапа сам НЕ вызывает AR.clear(), только добавляет элементы.
   */
  BeginStream({ stream, scene }: { stream: string; scene: string; captureInput?: boolean }): void {
    const { getCurrentScene } = require('./SceneRegistry');
    this._previousScene = getCurrentScene();
    this._streamName = stream;

    setTimeout(() => {
      loadScene(scene).catch((err) => {
        console.error(`[Scene] Ошибка BeginStream "${scene}":`, err);
      });
    }, 0);
  }

  /**
   * Закрыть попап и вернуться к предыдущей сцене.
   * Аналог Scene:EndStream в оригинале.
   *
   * Перезагружает предыдущую сцену — та вызывает AR.clear() и пересобирает себя.
   */
  EndStream(streamName?: string): void {
    const target = this._previousScene;
    this._previousScene = null;

    if (!target) {
      console.warn('[Scene] EndStream: нет предыдущей сцены для возврата');
      return;
    }

    setTimeout(() => {
      loadScene(target).catch((err) => {
        console.error(`[Scene] Ошибка EndStream возврата на "${target}":`, err);
      });
    }, 0);
  }

  /** Принудительно задать имя стрима (используется в SceneRegistry) */
  _setStream(name: string): void {
    this._streamName = name;
  }
}

export const Scene = new SceneClass();