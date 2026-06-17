# Mmm Fingers — Roblox edition

A Roblox/Luau recreation of [Noodlecake's *Mmm Fingers*](https://play.google.com/store/apps/details?id=com.noodlecake.mmmfingers).

**Keep your finger down. Don't touch the monsters.**

You hold and drag a little green creature around an arena while red monsters
drift, weave and hunt you. Touch one and you're caught. The longer you survive,
the more monsters appear and the faster everything moves.

This is a screen-space GUI game (no 3D parts), so it plays the same on PC and
mobile — mouse on desktop, touch-and-drag on phones/tablets.

## Gameplay

- **Drag** the green blob with your finger (or mouse). On touch devices, lifting
  your finger stops the blob — and the monsters keep coming.
- **Avoid** every monster. Any contact ends the run.
- **Score** climbs the longer you last. Your best score is saved per player.

### Monster types

| Monster  | Behaviour                                   |
| -------- | ------------------------------------------- |
| Drifter  | Drifts straight, bounces off the walls      |
| Runt     | Small and fast                              |
| Zigger   | Weaves in a zig-zag                          |
| Stalker  | Slow, but homes in on you                   |
| Brute    | Big and slow — clogs up your escape routes  |

Difficulty (spawn rate, monster count, speed) ramps up automatically with the
time you survive — see `src/shared/Config.lua` to retune any of it.

## Project layout

```
roblox-mmm-fingers/
├── default.project.json        # Rojo project (maps src/ into the data model)
├── aftman.toml                 # Pins the Rojo CLI version
└── src/
    ├── shared/                 # → ReplicatedStorage.MmmFingers (ModuleScripts)
    │   ├── Config.lua          #   all tunable gameplay numbers
    │   ├── EnemyTypes.lua      #   monster definitions + weighted picker
    │   ├── Utils.lua           #   small math/format helpers
    │   └── Remotes.lua         #   shared RemoteEvent/Function setup
    ├── server/                 # → ServerScriptService
    │   └── HighScoreServer.server.lua   # DataStore-backed best scores
    └── client/                 # → StarterPlayer.StarterPlayerScripts
        ├── UI.lua              #   builds the whole interface in code
        └── MmmFingers.client.lua        # game loop: input, AI, collision, score
```

## Build & run

You need [Roblox Studio](https://create.roblox.com/) and
[Rojo](https://rojo.space/).

1. Install the tooling (via [Aftman](https://github.com/LPGhatguy/aftman)):
   ```sh
   cd roblox-mmm-fingers
   aftman install
   ```
2. Build a place file you can open directly in Studio:
   ```sh
   rojo build -o MmmFingers.rbxl
   ```
   Open `MmmFingers.rbxl` and press **Play**.
3. Or, for live editing, open any place in Studio, install the **Rojo** Studio
   plugin, then run:
   ```sh
   rojo serve
   ```
   and click **Connect** in the plugin.

> High scores persist via `DataStoreService`. That only works in a **published**
> place with *Studio access to API services* enabled. Everywhere else the game
> still runs fine — scores just live for the session (the server code is
> `pcall`-guarded for exactly this reason).
