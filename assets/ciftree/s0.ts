// ─────────────────────────────────────────────────────────────────────────────
// s0_SC.ts — стартовая сцена: инициализация флагов, переход на TitleMenu
//
// Запускается один раз при старте игры.
// Аналог оригинального s0.lua — без анимаций логотипов, только init + переход.
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import AR from '../../src/engine/AssetRenderer';
import { Flags } from '../../src/engine/Flags';
import { Scene } from '../../src/engine/Scene';

export default function () {
  AR.clear();
  AR.Summary({ env: 'UI', bg: 'toast_BG' });

  // ── Инициализация всех флагов игры (из Flags_SC.lua + UI_Touch_FL) ────────
  Flags.init([
    // Телефон
    'CELLPHONE_Dead_FL',
    'CELLPHONE_Enable_Camera_FL',
    'CELLPHONE_Enable_Gallery_FL',
    'CELLPHONE_Enable_Games_FL',
    'CELLPHONE_Enable_Hints_FL',
    'CELLPHONE_Enable_Journal_FL',
    'CELLPHONE_Enable_Menu_FL',
    'Cellphone_Enable_Messages_FL',
    'CELLPHONE_Enable_Options_FL',
    'CELLPHONE_Enable_Talk_FL',
    'CELLPHONE_Enable_Wallpaper_FL',
    'CELLPHONE_Games_AggregationNewHighScore_FL',
    'CELLPHONE_Receiving_Call_FL',
    'CELLPHONE_PreventBackOut_FL',
    // Разговоры
    'CONVO_FadeOut_FL',
    'Convo_ForceOpaque_FL',
    // Режимы
    'InCellGames_FL',
    'InForcedConvo_FL',
    'InForcedText_FL',
    'Opening_Cine_FL',
    'P_Is_Nancy_FL',
    // Туториал
    'TUT_FromBadges_FL',
    // UI
    'UI_CameraOn_FL',
    'UI_Cellphone_Games_Landrush_Won_FL',
    'UI_ForcedCallRing_FL',
    'UI_INV_Book_Open_FL',
    'UI_OpeningForcedCall_FL',
    'UI_PuzzleFlash_FL',
    'UI_SavePromptEnabled_FL',
    'UI_SkipTitleFadeIn_FL',
    'UI_TasklistExpanded_FL',
    // Тач-устройство (наш флаг)
    'UI_Touch_FL',
  ]);

  // ── Определение тач-устройства ────────────────────────────────────────────
  // iOS / Android — всегда тач.
  // Web — проверяем наличие touch events у браузера.
  const isTouch =
    Platform.OS === 'ios' ||
    Platform.OS === 'android' ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && 'ontouchstart' in window);

  Flags.UI_Touch_FL = isTouch;

  // ── Переход на главное меню ───────────────────────────────────────────────
  Scene.Change('Main', 'TitleMenu_SC');
}