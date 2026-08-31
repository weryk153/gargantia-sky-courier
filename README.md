# Gargantia: Sky Courier

A 3D arcade flight game built on the [Turbulenz Engine](https://github.com/turbulenz/turbulenz_engine),
released by Turbulenz in 2014 and abandoned shortly after. It stopped working in
modern browsers somewhere along the way. This repository is that game, fixed.

**▶ Play it: https://weryk153.github.io/gargantia-sky-courier/**

You fly a surf-kite through rings above the floating city of Gargantia, against
the clock. The full in-game level editor ships with it.

---

## Playing

| | |
| --- | --- |
| Fly | `WASD` or arrow keys |
| Boost | `Space` |
| Editor | `Enter` (toggles in and out) |

Fly through the rings in order before time runs out. The panel on the left is
the DynamicUI debug console — expand any section to inspect and tweak the game
while it runs. **Debug Draw → Camera** is a good first thing to try: it shows how
the camera gets dragged around by the character.

## The level editor

Press `Enter` at any point to drop into editor mode, where you can move, rotate,
scale, add and delete entities. Press `Enter` again to return to the game at the
start of the level, with your changes live.

**Save Level** writes the level to your browser's local storage and **Load Edited
Level** reads it back, so edits survive a reload. **Reset Level** restores the
original mission. Nothing is uploaded anywhere — the saved level never leaves
your machine.

## Running it locally

There is no build step and nothing to install. Any static web server pointed at
the repository root will do:

```
python3 -m http.server 8000
```

```
npx http-server -p 8000
```

Then open http://localhost:8000. You need a browser with WebGL — see
[Browser support](#browser-support).

## What was fixed

The engine is as Turbulenz shipped it apart from three changes, each a case of
the web moving on underneath 2014 code.

### Skinned animation crashed on load

`game/jslib/webgl/graphicsdevice.js`

`setData` and `unmap` for technique parameter buffers were installed inside an
`if (Float32Array.prototype.map === undefined)` guard. Since ES2015 every browser
ships a native `TypedArray.prototype.map`, so that guard is always false and
neither helper was ever installed. `animation.js` (skinning matrices) and
`forwardrendering.js` (light parameters) both call `setData`, so uploading a
character pose threw `output.setData is not a function`.

Each helper now feature-detects itself. The engine's own `map` — which took
`(offset, numFloats)` rather than a callback — is deliberately not reinstated:
nothing calls it on these buffers, and overwriting the native `map` would break
standard behaviour elsewhere.

### The game ran completely silent

`game/jslib/webgl/sounddevice.js`

Browsers now refuse to start audio until the user has interacted with the page,
and they refuse in two separate ways: an `AudioContext` is created `suspended`,
and `HTMLMediaElement.play()` returns a promise that rejects with
`NotAllowedError`. This engine predates both — it never called `resume()`, and it
ignored the promise from `play()`, which additionally surfaced as unhandled page
errors in Firefox.

Both paths matter, because short effects are decoded into Web Audio buffers while
music and ambience stream through `<audio>` elements. An `autoplayUnlock` helper
now recovers both on the first real user gesture.

### `index.html` had a corrupted tail

Everything after `</html>` was a byte-for-byte duplicate of the last 35 lines of
the `window.onload` handler, with its first line severed — the remains of a bad
copy-paste. Browsers were lenient enough to parse it as a stray text node rather
than fail, but it was dead markup that leaked engine source onto the page as
visible text. Removed.

## Browser support

Each engine was driven through load, flight, the editor and a save/load round
trip, watching for console errors and measuring real audio output at the
destination node.

| Engine | Result |
| --- | --- |
| Chrome / Edge | 60 FPS, no console errors, audio confirmed |
| Firefox | 61 FPS, no console errors, audio confirmed |
| WebKit | 51 FPS, no console errors, audio confirmed |

The textures are DDS files using S3TC block compression, which was the one real
risk for Safari — but WebKit does expose `WEBGL_compressed_texture_s3tc` and the
game renders correctly there. WebKit also reports its `AudioContext` as
`interrupted` rather than `suspended` when the audio session is unavailable,
which the autoplay fix handles the same way.

Two caveats: those WebKit numbers come from Playwright's build rather than
Safari.app, and iOS is untested. The game has touch control code but was built
for desktop.

## How the code is organised

This is a debug build, so every source file is loaded on each run — edit a file,
reload the page, and the change is live.

| Path | |
| --- | --- |
| `game/scripts` | The game itself. Most of what you would want to change lives here — `entitycomponents/eclocomotion.js` drives the character's movement, for instance. |
| `game/jslib` | The Turbulenz engine. |
| `game/editor` | The in-game level editor. |
| `game/assets` | Uncompiled source art: models, textures, sounds, shaders. The game does not read these at runtime — with one exception, `game/assets/levels`, which the editor loads the original mission from. |
| `staticmax` | The built assets the game actually loads, under content-hashed names. |
| `mapping_table.json` | Maps readable asset names onto those hashed filenames. |
| `dynamicui` | The debug panel down the left of the page, and its libraries. |
| `css`, `img` | Page styling and chrome. |

## Licence

Two licences apply, as set out in [LICENSE](LICENSE):

- **Software** — `game/`, `dynamicui/`, `index.html` — is **MIT**, Copyright (c)
  2009–2014 Turbulenz Limited. The fixes in this fork are contributed under the
  same terms.
- **Assets** — `staticmax/`, `game/assets/`, `img/` — are **CC BY-NC 4.0**:
  attribution required, **non-commercial use only**.

The non-commercial clause on the assets is the binding constraint. This
repository and any deployment of it must not be monetised — no ads, no sale, no
paid service.

## Credits and history

Gargantia: Sky Courier was made by [Turbulenz](https://github.com/turbulenz),
with Microsoft and Production I.G. *Gargantia on the Verdurous Planet* is the
property of Production I.G; Turbulenz released these assets under the terms
above.

This is a fork of
[turbulenz/gargantia_editor](https://github.com/turbulenz/gargantia_editor),
which has not been touched since June 2014. Turbulenz has since wound down —
`turbulenz.com` now redirects elsewhere, and the game's own site is gone. The
original material survives only in the Internet Archive:

- [The game's site, fly.gargantia.jp](http://web.archive.org/web/20160519105939/http://fly.gargantia.jp:80/) (2016 capture)
- [The Modern.IE developer teardown](http://web.archive.org/web/20150410094604/https://www.modern.ie/en-us/demos/gargantia) — a walkthrough of how the game was built (2015 capture)

The [Turbulenz Engine](https://github.com/turbulenz/turbulenz_engine) itself is
still on GitHub.
