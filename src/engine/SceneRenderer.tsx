// ─────────────────────────────────────────────────────────────────────────────
// SceneRenderer.tsx — рендерер сцены
//
// Слои снизу вверх: Summary → Movies → Overlays → Buttons
// ─────────────────────────────────────────────────────────────────────────────

import React, { memo, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';

import { resolveVideoAsset, resolveCiftreeAsset, resolveCiftreeKey } from './AssetRegistry';
import { useAssetRenderer } from './useAssetRenderer';
import type {
  ButtonConfig,
  MovieConfig,
  OverlayConfig,
  RectData,
  SummaryConfig,
  ViewportSize,
} from './AssetRenderer';

const UI_WIDTH  = 1024;
const UI_HEIGHT = 768;

function resolveRect(r: RectData | ViewportSize): RectData {
  return r === 'uiSize' ? { x1: 0, y1: 0, x2: UI_WIDTH, y2: UI_HEIGHT } : r;
}

const rW = (r: RectData) => r.x2 - r.x1;
const rH = (r: RectData) => r.y2 - r.y1;

// ─────────────────────────────────────────────────────────────────────────────
// CroppedImage
// ─────────────────────────────────────────────────────────────────────────────

type CroppedImageProps = {
  imageSource: ReturnType<typeof resolveCiftreeAsset>;
  src: RectData;
  scrW: number;
  scrH: number;
  left?: number;
  top?: number;
  zIndex?: number;
  resolution?: 1 | 2;
  pointerEvents?: 'none' | 'box-none' | 'auto';
};

const CroppedImage = memo(function CroppedImage({
  imageSource,
  src,
  scrW,
  scrH,
  left = 0,
  top = 0,
  zIndex = 0,
  resolution = 1,
  pointerEvents = 'none',
}: CroppedImageProps) {
  const hasCrop = src.x1 !== 0 || src.y1 !== 0;

  // 1. Синхронная попытка (если сборщик отдал размеры файла)
  const sourceObj = imageSource as any;
  const initialW = sourceObj?.width;
  const initialH = sourceObj?.height;

  const [natSize, setNatSize] = useState<{ w: number; h: number } | null>(
    initialW && initialH ? { w: initialW, h: initialH } : null
  );

  // 2. Асинхронный фикс для WEB
  useEffect(() => {
    if (hasCrop && !natSize && Platform.OS === 'web') {
      const uri = typeof imageSource === 'string'
        ? imageSource
        : sourceObj?.uri || sourceObj?.default;

      if (uri) {
        const img = new window.Image();
        img.onload = () => setNatSize({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = uri;
      }
    }
  }, [hasCrop, natSize, imageSource, sourceObj]);

  if (!hasCrop) {
    return (
      <View
        style={{ position: 'absolute', left, top, width: scrW, height: scrH, zIndex, overflow: 'hidden' }}
        pointerEvents={pointerEvents}
      >
        <Image source={imageSource} style={{ width: scrW, height: scrH }} resizeMode="stretch" />
      </View>
    );
  }

  const imgStyle = natSize
    ? {
        position: 'absolute' as const,
        left:   -src.x1 / resolution,
        top:    -src.y1 / resolution,
        width:   natSize.w / resolution,
        height:  natSize.h / resolution,
      }
    : {
        position: 'absolute' as const,
        width: scrW,
        height: scrH,
        opacity: 0 as const,
      };

  return (
    <View
      style={{ position: 'absolute', left, top, width: scrW, height: scrH, zIndex, overflow: 'hidden' }}
      pointerEvents={pointerEvents}
    >
      <Image
        source={imageSource}
        style={imgStyle}
        resizeMode="stretch"
        onLoad={(e) => {
          // 3. Асинхронный фикс для MOBILE
          if (Platform.OS !== 'web' && !natSize) {
            const source = (e.nativeEvent as any).source;
            if (source?.width && source?.height) {
              setNatSize({ w: source.width, h: source.height });
            }
          }
        }}
      />
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SummaryLayer
// ─────────────────────────────────────────────────────────────────────────────

const SummaryLayer = memo(function SummaryLayer({ config }: { config: SummaryConfig }) {
  return (
    <Image source={resolveVideoAsset(config.bg)} style={styles.summary} resizeMode="contain" />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OverlayLayer
// ─────────────────────────────────────────────────────────────────────────────

const OverlayLayer = memo(function OverlayLayer({ config }: { config: OverlayConfig }) {
  if (config.visible === false) return null;
  const src = resolveRect(config.source);
  const scr = resolveRect(config.onScreen);

  return (
    <CroppedImage
      imageSource={resolveCiftreeAsset(resolveCiftreeKey(config.ovl, config.resolution))}
      src={src} scrW={rW(scr)} scrH={rH(scr)} left={scr.x1} top={scr.y1}
      zIndex={config.z ?? 0} resolution={config.resolution ?? 1}
    />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MovieLayer
// ─────────────────────────────────────────────────────────────────────────────

const MovieLayer = memo(function MovieLayer({ config }: { config: MovieConfig }) {
  const videoRef = useRef<Video>(null);
  const src  = resolveRect(config.source);
  const scr  = resolveRect(config.onScreen);
  const scrW = rW(scr);
  const scrH = rH(scr);
  const hasCrop = src.x1 !== 0 || src.y1 !== 0;

  return (
    <View
      style={{ position: 'absolute', left: scr.x1, top: scr.y1, width: scrW, height: scrH, zIndex: config.z ?? 0, overflow: 'hidden' }}
      pointerEvents="none"
    >
      <Video
        ref={videoRef}
        source={resolveVideoAsset(config.movie)}
        style={hasCrop
          ? { position: 'absolute', left: -src.x1, top: -src.y1, width: src.x2, height: src.y2 }
          : { width: scrW, height: scrH }
        }
        resizeMode={ResizeMode.STRETCH}
        isLooping={config.loop ?? false}
        shouldPlay
        isMuted
        onPlaybackStatusUpdate={(status) => {
          if (config.pauseOnLastFrame && status.isLoaded && status.didJustFinish) {
            videoRef.current?.pauseAsync();
          }
        }}
      />
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ButtonLayer
//
// Проблема: onHoverIn на вебе срабатывает при монтировании компонента,
// если курсор уже находится над зоной кнопки (например, при смене сцены).
// На главном меню кнопки узкие и внизу — почти не задевает.
// На Badges кнопки огромные и по центру — курсор попадает почти всегда.
//
// Фикс: canHover ref. После монтирования ждём один requestAnimationFrame
// (браузер успевает разослать начальные mouseover-события и они игнорируются),
// затем разрешаем hover. Реальный mouseenter пользователя приходит уже после.
// ─────────────────────────────────────────────────────────────────────────────

const ButtonLayer = memo(function ButtonLayer({ config }: { config: ButtonConfig }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Guard: не разрешаем hover до первого rAF после монтирования.
  // Это отсекает синтетический mouseover, который браузер шлёт при появлении
  // элемента под уже стоящим курсором.
  const canHover = useRef(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      canHover.current = true;
    });
    return () => {
      cancelAnimationFrame(raf);
      // Сбрасываем при анмаунте (смена сцены) — следующий mount начнёт заново
      canHover.current = false;
    };
  }, []);

  const hs  = config.hs.onScreen;
  const hsL = hs.x1;
  const hsT = hs.y1;
  const hsW = rW(hs);
  const hsH = rH(hs);

  const hasDownOvl = !!config.downOvl;

  const showDownOvl = pressed && hasDownOvl;
  const showOverOvl = (hovered && !showDownOvl) || (pressed && !hasDownOvl);

  const renderOvl = (ovl: ButtonConfig['overOvl'] | ButtonConfig['downOvl']) => {
    if (!ovl) return null;
    const src = resolveRect(ovl.source);
    const scr = resolveRect(ovl.onScreen);
    return (
      <CroppedImage
        imageSource={resolveCiftreeAsset(resolveCiftreeKey(ovl.ovl, ovl.resolution))}
        src={src} scrW={rW(scr)} scrH={rH(scr)}
        left={scr.x1 - hsL} top={scr.y1 - hsT}
        resolution={ovl.resolution ?? 1} pointerEvents="none"
      />
    );
  };

  const renderHsOvl = () => {
    if (!config.hs.ovl || !config.hs.source) return null;
    const src = resolveRect(config.hs.source);
    return (
      <CroppedImage
        imageSource={resolveCiftreeAsset(config.hs.ovl)}
        src={src} scrW={hsW} scrH={hsH} left={0} top={0} pointerEvents="none"
      />
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: hsL, top: hsT, width: hsW, height: hsH,
        zIndex: config.z ?? 10,
        overflow: 'visible',
      }}
      pointerEvents="box-none"
    >
      {renderHsOvl()}
      {showOverOvl && renderOvl(config.overOvl)}
      {showDownOvl && renderOvl(config.downOvl)}

      <Pressable
        style={[
          StyleSheet.absoluteFillObject,
          Platform.OS === 'web' ? { cursor: config.hs.cursor ?? 'pointer' } as any : {},
        ]}
        onHoverIn={() => {
          if (canHover.current) setHovered(true);
        }}
        onHoverOut={() => {
          setHovered(false);
        }}
        onPressIn={() => {
          setPressed(true);
          config.OnDown?.();
        }}
        onPressOut={() => {
          setPressed(false);
          config.OnUp?.();
        }}
      />
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SceneRenderer — корневой компонент
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SceneRenderer — корневой компонент
// ─────────────────────────────────────────────────────────────────────────────

export const SceneRenderer = memo(function SceneRenderer() {
  const { summary, overlays, movies, buttons } = useAssetRenderer();

  const buttonOvlIds = new Set<string>();
  buttons.forEach((b) => {
    if (b.overOvl) buttonOvlIds.add(b.overOvl.id);
    if (b.downOvl) buttonOvlIds.add(b.downOvl.id);
  });

  const standaloneOverlays = overlays.filter((o) => !buttonOvlIds.has(o.id));

  const sortedMovies   = [...movies  ].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  const sortedOverlays = [...standaloneOverlays].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

  return (
    <View style={styles.root} pointerEvents="box-none">
      {summary && <SummaryLayer config={summary} />}
      {sortedMovies.map((m) => <MovieLayer key={m.id} config={m} />)}
      {sortedOverlays.map((o) => <OverlayLayer key={o.id} config={o} />)}
      {buttons.map((b) => <ButtonLayer key={b.id} config={b} />)}
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  summary: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});