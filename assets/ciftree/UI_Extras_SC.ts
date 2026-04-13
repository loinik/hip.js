// ─────────────────────────────────────────────────────────────────────────────
// UI_Extras_SC.ts — попап «Extras» поверх главного меню
//
// НЕ вызывает AR.clear() — монтируется поверх текущей сцены.
// Закрывается через Scene.EndStream(), который перезагружает предыдущую сцену.
// ─────────────────────────────────────────────────────────────────────────────

import AR, { Rect } from '../../src/engine/AssetRenderer';
import { Scene } from '../../src/engine/Scene';

export default function () {
    // ── Затемнение под попапом ────────────────────────────────────────────────
    // Color:New(160, 0, 0, 0) в оригинале = RGBA(0,0,0,160) ≈ 62.7% непрозрачности
    AR.FillRect({
        r: 0, g: 0, b: 0, a: 160,
        onScreen: 'uiSize',
        blockInput: true,   // не даём кликать на кнопки главного меню под попапом
        z: 10,
    });

    // ── Фон панели ────────────────────────────────────────────────────────────
    // source: Rect(2, 2, 547, 425) → onScreen: Rect(241, 101, 786, 524)
    AR.Overlay({
        ovl: 'UI_MainExtras_OVL',
        source: Rect(2, 2, 547, 425),
        onScreen: Rect(241, 101, 786, 524),
        z: 11,
    });

    // ── Кнопки ────────────────────────────────────────────────────────────────
    // Все кнопки без OnDown/OnUp пока — заглушка покажет alert по умолчанию из AR.

    const awardsButton = AR.Button({
        hs: AR.Hotspot({
            onScreen: Rect(414, 210, 610, 246),
            cursor: 'MenuHot',
        }),
        overOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 2, 745, 38),
            onScreen: Rect(414, 210, 610, 246),
        }),
        downOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 40, 745, 76),
            onScreen: Rect(414, 210, 610, 246),
        }),
        z: 12,
        OnUp: () => {
            // Scene.BeginStream({ stream: 'ExtrasUIStream', scene: 'UI_MM_MetaAwards_SC' })
        },
    });

    const creditsButton = AR.Button({
        hs: AR.Hotspot({
            onScreen: Rect(414, 258, 610, 294),
            cursor: 'MenuHot',
        }),
        overOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 78, 745, 114),
            onScreen: Rect(414, 258, 610, 294),
        }),
        downOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 116, 745, 152),
            onScreen: Rect(414, 258, 610, 294),
        }),
        z: 13,
        OnUp: () => {
            // Scene.BeginStream({ stream: 'ExtrasUIStream', scene: 'Credits_SC' })
        },
    });

    const teaserButton = AR.Button({
        hs: AR.Hotspot({
            onScreen: Rect(414, 306, 610, 342),
            cursor: 'MenuHot',
        }),
        // Locked overlay (всегда виден поверх — заблокировано до прохождения игры)
        baseOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 154, 745, 190),
            onScreen: Rect(414, 306, 610, 342),
        }),
        overOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 192, 745, 228),
            onScreen: Rect(414, 306, 610, 342),
        }),
        downOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 230, 745, 266),
            onScreen: Rect(414, 306, 610, 342),
        }),
        z: 14,
        OnUp: () => {
            // Scene.BeginStream({ stream: 'ExtrasUIStream', scene: 'Teaser_SC' })
        },
    });

    const bonusButton = AR.Button({
        hs: AR.Hotspot({
            onScreen: Rect(414, 354, 610, 390),
            cursor: 'MenuHot',
        }),
        // baseOvl — всегда виден: декоративная рамка кнопки бонуса
        baseOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 420, 755, 466),
            onScreen: Rect(410, 350, 616, 396),
        }),
        // lockedBonus overlay (всегда виден поверх — заблокировано)
        overOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 268, 745, 304),      // locked state
            onScreen: Rect(414, 354, 610, 390),
        }),
        downOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 344, 745, 380),
            onScreen: Rect(414, 354, 610, 390),
        }),
        z: 15,
        OnUp: () => {
            // Scene.BeginStream({ stream: 'ExtrasUIStream', scene: 'BonusArt_SC' })
        },
    });

    // ── Done (Cancel) — закрывает попап и возвращает на предыдущую сцену ──────
    const doneButton = AR.Button({
        hs: AR.Hotspot({
            onScreen: Rect(464, 413, 560, 449),
            cursor: 'MenuHot',
        }),
        overOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(549, 382, 645, 418),
            onScreen: Rect(464, 413, 560, 449),
        }),
        downOvl: AR.Overlay({
            ovl: 'UI_MainExtras_OVL',
            source: Rect(647, 382, 743, 418),
            onScreen: Rect(464, 413, 560, 449),
        }),
        z: 15,
        OnUp: () => {
            Scene.EndStream(Scene.streamName);
        },
    });
}