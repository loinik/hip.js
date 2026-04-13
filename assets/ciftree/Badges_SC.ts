import AR, { Rect } from '../../src/engine/AssetRenderer';
import { Flags } from '../../src/engine/Flags';
import { Scene } from '../../src/engine/Scene';
import { loadScene } from '../../src/engine/SceneRegistry';

export default function () {
  AR.clear();

  let difficultyBG = AR.Summary({
    env: 'OPN',
    bg: 'UI_Difficulty_BG',
  });

  let juniorDiffButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(200, 188, 415, 400),
      cursor: "MenuHot"
    }),
    overOvl: AR.Overlay({
      ovl: "UI_Difficulty_OVL",
      source: Rect(2, 2, 217, 214),
      onScreen: Rect(200, 188, 415, 400)
    }),
    OnDown: () => { }
  });

  let seniorDiffButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(608, 188, 823, 400),
      cursor: "MenuHot"
    }),
    overOvl: AR.Overlay({
      ovl: "UI_Difficulty_OVL",
      source: Rect(219, 2, 434, 214),
      onScreen: Rect(608, 188, 823, 400)
    }),
      OnDown: () => { }
  });

  let tutorialButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(466, 421, 561, 488),
      cursor: "MenuHot"
    }),
    overOvl: AR.Overlay({
      ovl: "UI_Difficulty_OVL",
      source: Rect(198, 216, 293, 283),
      onScreen: Rect(466, 421, 561, 488)
    }),
    downOvl: AR.Overlay({
      ovl: "UI_Difficulty_OVL",
      source: Rect(295, 216, 390, 283),
      onScreen: Rect(466, 421, 561, 488)
    }),
    OnDown: () => { }
  });

  let cancelButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(466, 677, 562, 713),
      cursor: "MenuHot"
    }),
    downOvl: AR.Overlay({
      ovl: "UI_Difficulty_OVL",
      source: Rect(100, 216, 196, 252),
      onScreen: Rect(466, 677, 562, 713)
    }),
    overOvl: AR.Overlay({
      ovl: "UI_Difficulty_OVL",
      source: Rect(2, 216, 98, 252),
      onScreen: Rect(466, 677, 562, 713)
    }),
    OnUp: () => {
      Scene.Change('Main', 'TitleMenu_SC');
    }
  });
}