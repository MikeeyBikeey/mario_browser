# Mario Browser
Mario running in Google Chrome. (Still in prototyping phase. Not ready for use.)\
![Goofy gif of Mario running around the browser](/media/mario_browser.gif)

Summon the help of a local plumber to clean your browser page.

## How to Play
Press the extension icon and then press the plumber in the popup.\
![Example Screenshot](/media/popup_example.png)
### Controls
* Jump: `W`
* Walk: `A` and `D`
* Run: `Shift` or `Space`
* Crouch: `S`
### Gameplay
* Green warp pipes lead to websites in the current domain.
* Red warp pipes lead to websites outside the current domain.

## Installation
This project is a Google Chrome Extension. However, since this project is not on the Google Play Store, some extra steps are required for installation.
1. [Download the latest release](https://github.com/MikeeyBikeey/mario_browser/releases/latest/download/mario_browser.zip) from the releases page.
2. Extract the downloaded file.
3. Open Chrome and navigate to the [Chrome Extensions page](chrome://extensions/).
4. Enable `Developer mode` in the upper right hand side.
5. Press `Load unpacked` and select the extracted folder from step 2.

Let's-a go! Your plumber should be ready to go.

## Build Instructions
The Godot game is placed in the root [godot](/godot) directory. The Chrome extension is placed in the root [extension](/extension) directory.

To make changes to the game and have the browser reflect them, the Godot game must be exported to the file location `extension/game.pck` as a `pck` file with the `HTML` export.
Refreshing any already-existing web pages should reflect changes to the game. There is no need to refresh the extension itself.

## Known Issues
The web is a weird place. It is hard to account for every way a website can be configured.\
The plumber can be missing if the website prevents the Godot Engine scripts from compiling the `wasm` file.\
The plumber can appear to float (sometimes) if there is hidden text.\
The plumber can straight up phase through text if the text is an image or detected as transparent.\
The plumber can also experience lag and slowness if the webpage is too much for the computer, likely too many ads.

## How does it work?
This project is a [Google Chrome Extension](https://developer.chrome.com/docs/extensions/) and a [Godot](https://godotengine.org/) game bundled together.\
Essentially, this is a Google Chrome Extension (Manifest V3) that leverages the [Godot 3.5 HTML export](https://docs.godotengine.org/en/3.5/tutorials/export/exporting_for_web.html) for the game.

The Godot Engine scripts are located at [`extension/scripts/godot.js`](/extension/scripts/godot.js) and [`extension/scripts/godot.wasm`](/extension/scripts/godot.wasm), and the game pack is located at `extension/game.pck` (excluded from version control; read [build instructions](#build-instructions)).

### License
The [Super Mario™](https://mario.nintendo.com/) franchise is a registered trademark of [Nintendo](https://www.nintendo.com/).

Source code licensed under the [MIT license](/LICENSE).
