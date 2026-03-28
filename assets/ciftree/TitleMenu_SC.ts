import AR, { Rect } from '../../src/engine/AssetRenderer';
import { Scene } from '../../src/engine/Scene';
import { loadScene } from '../../src/engine/SceneRegistry';


export default function () {
  AR.clear();

  AR.Summary({
    id: 'sum',
    env: 'UI',
    bg: 'MID_MainMenu_BG',
  });

  let nancyDrewOVL = AR.Overlay({
    ovl: 'UI_MainMenuTitleND_OVL_2x',
    source: Rect(0, 0, 808, 366),
    onScreen: Rect(108, 83, 916, 449),
    z: 4,
    resolution: 2,
  });

  let titleOVL = AR.Overlay({
    ovl: 'MID_MainMenuTitle_OVL',
    source: Rect(0, 0, 808, 366),
    onScreen: Rect(108, 83, 916, 449),
    z: 5,
  });

  let textOVL = AR.Overlay({
    ovl: 'UI_MainMenu_OVL',
    source: Rect(0, 0, 1024, 96),
    onScreen: Rect(0, 672, 1024, 768),
    z: 6,
  });

  let newGameButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(43, 730, 169, 760),
      cursor: "MenuHot",
    }),
    overOvl: AR.Overlay({
      ovl: "UI_MainMenu_Rollover_OVL",
      source: Rect(2, 2, 128, 32),
      onScreen: Rect(43, 730, 169, 760)
    }),
    OnDown: () => {
      Scene.Change('Main', 'Badges_SC');
    }
  })

  let loadGameButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(203, 730, 329, 760),
      cursor: "MenuHot"
    }),
    overOvl: AR.Overlay({
      ovl: "UI_MainMenu_Rollover_OVL",
      source: Rect(2, 34, 128, 64),
      onScreen: Rect(203, 730, 329, 760)
    }),
    OnDown: () => {
      console.log(titleOVL.visible);
    }
  })

  let helpButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(364, 730, 473, 760),
      cursor: "MenuHot"
    }),
    overOvl: AR.Overlay({
      ovl: "UI_MainMenu_Rollover_OVL",
      source: Rect(2, 66, 111, 96),
      onScreen: Rect(364, 730, 473, 760)
    }),
    OnDown: () => { }
  });
  let optionsButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(503, 730, 610, 760),
      cursor: "MenuHot"
    }),
    overOvl: AR.Overlay({
      ovl: "UI_MainMenu_Rollover_OVL",
      source: Rect(2, 98, 109, 128),
      onScreen: Rect(503, 730, 610, 760)
    }),
    OnDown: () => { }
  })

  let extrasButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(635, 730, 742, 760),
      cursor: "MenuHot"
    }),
    overOvl: AR.Overlay({
      ovl: "UI_MainMenu_Rollover_OVL",
      source: Rect(2, 130, 109, 160),
      onScreen: Rect(635, 730, 742, 760)
    }),
    OnDown: () => { }
  })

  let moreNDButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(761, 730, 884, 760),
      cursor: "MenuHot"
    }),
    overOvl: AR.Overlay({
      ovl: "UI_MainMenu_Rollover_OVL",
      source: Rect(2, 162, 125, 192),
      onScreen: Rect(761, 730, 884, 760)
    }),
    OnDown: () => { }
  })

  let quitButton = AR.Button({
    hs: AR.Hotspot({
      onScreen: Rect(890, 730, 1006, 760),
      cursor: "MenuHot"
    }),
    overOvl: AR.Overlay({
      ovl: "UI_MainMenu_Rollover_OVL",
      source: Rect(2, 194, 118, 224),
      onScreen: Rect(890, 730, 1006, 760)
    }),
    OnDown: () => { }
  })
}