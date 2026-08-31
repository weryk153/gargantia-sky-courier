
# Gargantia Editor

## Introduction

This repository contains all the code required to run and edit the first mission of [Gargantia: Sky Courier](http://fly.gargantia.jp) a 3D arcade flight simulator based on the [Turbulenz Engine](http://github.com/turbulenz/turbulenz_engine). The developer teardown article on [Modern.IE](http://www.modern.ie/en-us/demos/gargantia) gives an introduction to the project and the technology, while this README contains all the technical info you need to get up and running!

## Modernisation

This is a fork of Turbulenz's original 2014 release, patched so that it still
runs in a current browser. The engine is otherwise untouched. See
[What was fixed](#what-was-fixed) for the details.

Play it at **https://weryk153.github.io/gargantia_editor/**

## Installation

All you need is the code in this repository and any static web server -- there
is no build step and no dependencies to install. Download the code either with
`git clone`, or as a zip file from the green **Code** button at the top of this
page. We will refer to the directory you end up with as the **project root**.

## Running a web server

You need a static web server and a browser with WebGL support. Chrome, Edge and
Firefox are all fine; see [Browser support](#browser-support) below for the
current state of Safari.

### Python

Python 3 ships with macOS and most Linux distributions, and is
[available for Windows here](https://www.python.org/downloads/). From the
**project root**, run:

```
python3 -m http.server 8000
```

### Node.js

With [Node.js](https://nodejs.org) installed, run this from the **project
root** -- no separate install step needed:

```
npx http-server -p 8000
```

### Running the sample

With your chosen web server running, open http://localhost:8000 in your
browser.

## The Game

### Controls

To start with you probably just want to try out the game to see how it works. The controls are simple, use 'WASD' or the arrow keys to fly the surf-kite around. To complete the level you must fly through the rings in order before time runs out. You can boost with the space bar to give yourself a little extra speed.

### Tweaking the game

To the left of the screen you can see the DynamicUI panel. Various sections of the UI can be expanded by clicking on them to offer up a number of checkboxes and other controls that allow you to inspect and tweak the game while it is running. Try clicking on **Debug Draw** and then selecting **Camera** to see how the camera is dragged around by the hero character.

## The Editor

At any point you can hit **enter** to drop into editor mode. In this mode you can edit and add entities to the level and save your results. Hitting **enter** again will switch back into game mode putting you at the start of the level with any changes you have made.

To make permanent changes to the level just hit the Save button in the Editor section of the DynamicUI panel. These changes will be saved locally in your browser and can then be loaded again using the Load button.

## The Code

As this is a debug build of the game all the source files are loaded every time the game is run, so to make changes to the source code you just need to change one of the files and hit reload.

The code is organised into several directories:

- :file_folder: **css** Styles for the page
- :file_folder: **dynamicui** code and styles for the controls in the side panel
 - :file_folder: **client** In-game code to activate the UI
 - :file_folder: **lib** External libraries used by the UI
 - :file_folder: **server** Runs the UI on the page
- :file_folder: **game** The game code
 - :file_folder: **assets** The mission file used by the sample
 - :file_folder: **editor** The Turbulenz in-game editor code
 - :file_folder: **jslib** The Turbulenz library
 - :file_folder: **scripts** The game code for the Gargantia Sky Courier sample
- :file_folder: **img** Images used by the page
- :file_folder: **staticmax** Assets (textures, sounds and other files) used by the game
- :scroll: **README.md** This file
- :scroll: **index.html** The main page of the web app
- :scroll: **mapping_table.json** This file maps from human-friendly asset names to the names of the files in the staticmax directory.

Most of the interesting code you will want to experiment with is in the **game/scripts** directory. Here you can find files such as **game/scripts/entitycomponents/eclocomotion.js** that controls the movement of the main character.

## What was fixed

The game was written in 2014 and stopped working correctly as browsers moved on.
Three changes were needed; the engine is otherwise as Turbulenz shipped it.

**Skinned animation crashed on load** --
`game/jslib/webgl/graphicsdevice.js`

`setData` and `unmap` for technique parameter buffers were installed inside a
`if (Float32Array.prototype.map === undefined)` guard. Since ES2015 every browser
ships a native `TypedArray.prototype.map`, so the guard was always false and
neither helper was ever installed. Both `animation.js` (skinning matrices) and
`forwardrendering.js` (light parameters) call `setData`, so uploading a character
pose threw `output.setData is not a function`. Each helper now feature-detects
itself. The engine's own `map` -- which took `(offset, numFloats)` rather than a
callback -- is deliberately not reinstated: nothing calls it on these buffers,
and overwriting the native `map` would break standard behaviour elsewhere.

**The game ran completely silent** --
`game/jslib/webgl/sounddevice.js`

Browsers now refuse to start audio until the user has interacted with the page,
and they refuse in two separate ways. An `AudioContext` is created in the
`suspended` state, and `HTMLMediaElement.play()` returns a promise that rejects
with `NotAllowedError`. The engine predates both: it never called `resume()`, and
it ignored the promise from `play()`, which additionally surfaced as unhandled
page errors in Firefox. A small `autoplayUnlock` helper now recovers both on the
first real user gesture -- the buffered sound effects and the streamed music
alike.

**`index.html` had a corrupted tail**

Everything after `</html>` was a duplicate of the last 35 lines of the
`window.onload` handler, left over from a bad copy-paste. Browsers were lenient
enough to render it as a stray text node rather than fail, but it was dead
markup and it leaked engine source onto the page. Removed.

## Browser support

Verified by driving each engine through load, flight, the level editor and a
save/load round trip, checking for console errors and measuring actual audio
output at the destination node.

| Engine | Result |
| --- | --- |
| Chrome / Edge | 60 FPS, no console errors, audio confirmed |
| Firefox | 61 FPS, no console errors, audio confirmed |
| WebKit (Safari) | 51 FPS, no console errors, audio confirmed |

The textures ship as DDS files using S3TC block compression, which was the one
real risk for Safari -- but WebKit does expose
`WEBGL_compressed_texture_s3tc`, and the game renders correctly there.

WebKit reports its `AudioContext` as `interrupted` rather than `suspended` when
the audio session is unavailable, which the autoplay fix treats the same way.

The WebKit figures come from Playwright's WebKit build, not Safari.app; they are
a good signal for the engine but not a substitute for testing on a real device.
iOS is untested -- the game has touch controls but was built for desktop.

## License

Two different licences apply, as set out in the [LICENSE](LICENSE) file:

- **Software** (everything under `game/`, `dynamicui/`, and `index.html`) is
  **MIT**, Copyright (c) 2009-2014 Turbulenz Limited. The compatibility fixes in
  this fork are contributed under the same licence.
- **Assets** (textures, models, sounds -- everything under `staticmax/`,
  `game/assets/` and `img/`) are **CC BY-NC 4.0**: attribution required,
  **non-commercial use only**.

The non-commercial restriction on the assets is the binding constraint. This
repository, and any deployment of it, must not be used commercially -- no ads,
no sale, no monetisation.

Gargantia on the Verdurous Planet is the property of Production I.G; the assets
here were released by Turbulenz under the terms above.

## Links

- [Gargantia: Sky Courier](http://fly.gargantia.jp)
- [Turbulenz Engine](http://github.com/turbulenz/turbulenz_engine)
- [Modern.IE Article (English)](http://www.modern.ie/en-us/demos/gargantia)
- [Modern.IE Article (Japanese)](http://www.modern.ie/ja-jp/demos/gargantia)
- [Turbulenz](http://turbulenz.com)

## Credits

The work provided in this repository is Copyright Turbulenz Limited 2014 unless stated otherwise.

Our thanks to all involved at Turbulenz, Microsoft and Production IG.

