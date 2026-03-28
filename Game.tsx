// ─────────────────────────────────────────────────────────────────────────────
// Game.tsx — главный игровой viewport
//
// • Базовое разрешение: 1024 × 768
// • Масштабируется по принципу object-fit: contain (меньший из scaleX / scaleY)
// • Alt + Enter — переключение fullscreen (только на вебе)
// • SceneRenderer рендерит текущую сцену из AR
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Platform, StatusBar } from 'react-native';
import { SceneRenderer } from './src/engine/SceneRenderer';
import { loadScene } from './src/engine/SceneRegistry';

// ── Константы ─────────────────────────────────────────────────────────────────

const BASE_WIDTH = 1024;
const BASE_HEIGHT = 768;

// Стартовая сцена — меняй по необходимости
const INITIAL_SCENE = 's0';

// ─────────────────────────────────────────────────────────────────────────────

export default function Game() {
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get('window')
  );
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneError, setSceneError] = useState<string | null>(null);

  // ── Масштаб viewport ───────────────────────────────────────────────────────

  const { width: screenWidth, height: screenHeight } = screenDimensions;
  const scaleX = screenWidth / BASE_WIDTH;
  const scaleY = screenHeight / BASE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  // ── Слушатель размеров экрана ──────────────────────────────────────────────

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // ── Web: чёрный фон + fullscreen по Alt+Enter ──────────────────────────────

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    document.body.style.backgroundColor = '#000';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(console.error);
        } else {
          document.exitFullscreen().catch(console.error);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Загрузка стартовой сцены ───────────────────────────────────────────────

  useEffect(() => {
    loadScene(INITIAL_SCENE)
      .then(() => setSceneReady(true))
      .catch((err) => {
        console.error('[Game] Ошибка загрузки сцены:', err);
        setSceneError(err?.message ?? String(err));
        setSceneReady(true); // всё равно рендерим (пустой экран лучше зависания)
      });
  }, []);

  // ── Рендер ────────────────────────────────────────────────────────────────

  {Platform.OS === 'ios' && <StatusBar hidden={true} />}

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.gameView,
          {
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Движок рендерит всё, что загружено в AR */}
        {sceneReady && <SceneRenderer />}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Занимает весь экран, центрирует игровую область
  screen: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameView: {
    backgroundColor: '#333',
    overflow: 'hidden',
  },
});