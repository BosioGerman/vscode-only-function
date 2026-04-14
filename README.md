# vscode-only-function

VS Code extension that lets you focus on a single function in the current file.

## Features

- Toggle "Only Function" mode with a hotkey.
- When enabled, all foldable regions are collapsed except the function at the cursor.
- Toggle again to restore full file visibility.

## Command and Hotkey

- Command: `Only Function: Toggle Current Function Focus`
- Command ID: `onlyFunction.toggle`
- Windows/Linux: `Ctrl+Alt+F`
- macOS: `Cmd+Alt+F`

## Run locally

1. Open this folder in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. Open a source file with functions.
4. Place the cursor inside a function and press the hotkey.
5. Press the hotkey again to show everything.
