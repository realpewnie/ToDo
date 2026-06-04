# ToDo

```txt
▄▄▄▄▄      ·▄▄▄▄
•██  ▪     ██▪ ██ ▪
 ▐█.▪ ▄█▀▄ ▐█· ▐█▌ ▄█▀▄
 ▐█▌·▐█▌.▐▌██. ██ ▐█▌.▐▌
 ▀▀▀  ▀█▄▀▪▀▀▀▀▀•  ▀█▄▀▪
               by pewnie
```

Terminal-style todo app built with Electron.

No big buttons. No huge dashboard. Just commands, tasks, and a little terminal energy.

```txt
current version: 1.5.0
```

## ./run

```bash
npm install
npm start
```

The app is meant to run through Electron. Live Preview can show the UI, but filesystem features like saving, loading, exiting, and language discovery need Electron.

## ./commands

```txt
~ > help                         show commands
~ > addtask finish README        add task
~ > removetask 1                 remove task
~ > edit 1 finish docs           edit task text
~ > move 3 1                     move task
~ > done 1                       mark done
~ > undone 1                     mark not done
~ > echo hello\nworld            print text, supports \n
~ > copy 2                       copy task text
~ > lang list                    list languages
~ > lang pl                      change language
~ > clear                        clear terminal
~ > about                        app info
~ > exit                         close app
```

## ./languages

Available language files live in `lang/`.

```txt
lang/en.json
lang/pl.json
lang/es.json
lang/de.json
lang/fr.json
```

Add another language by creating a new two-letter JSON file with the same keys, for example:

```txt
lang/it.json
```

Then run:

```txt
~ > lang list
~ > lang it
```

## ./storage

Tasks and the selected language are saved in `tasks.json`.

```json
{"lang": "en",
  "tasks": [
    {
      "text": "finish README",
      "done": false
    }
  ]
}
```

Task status is rendered like this:

```txt
1. [✗] not done yet
2. [✓] done
```

## ./files

```txt
index.html       app shell
renderer.js      command logic and app UI behavior
style.css        terminal styling
main.js          Electron main process
preload.js       bridge between UI and Electron
tasks.json       saved language and tasks
lang/*.json      translations
JetBrainsMono.ttf
```

## ./build

```bash
npm run build:win
npm run build:linux
```

Current `1.5.0` build targets:

```txt
Windows:
  ToDo Setup 1.5.0.exe

Linux:
  ToDo-1.5.0.AppImage
  todo-1.5.0.pacman
  todo_1.5.0_amd64.deb
```

## ./dev-notes

This project uses:

```txt
Electron
HTML
CSS
JavaScript
JSON language files
```

The renderer does not write files directly. It calls Electron through `preload.js`, then `main.js` handles filesystem access.

Selecting text in the app copies it to the clipboard after the mouse button is released. The `copy <number>` command uses the same clipboard bridge.

## ./credits

```txt
font: JetBrains Mono by JetBrains
ascii logo: generated with patorjk.com's Text to ASCII Art Generator
look: inspired by bash, Alacritty, and Omarchy <3
```
