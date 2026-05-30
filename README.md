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

## ./run

```bash
npm install
npm start
```

The app is meant to run through Electron. Live Preview can show the UI, but filesystem features like saving, loading, exiting, and language discovery need Electron.

## ./commands

```txt
~ > help
```

Prints the command list.

```txt
~ > addtask finish README
```

Adds a task.

```txt
~ > removetask 1
```

Removes task `1`.

```txt
~ > edit 1 finish terminal README
```

Changes the text of task `1`.

```txt
~ > move 3 1
```

Moves task `3` to position `1`.

```txt
~ > done 1
```

Marks task `1` as done.

```txt
~ > undone 1
```

Marks task `1` as not done.

```txt
~ > echo hello\nworld
```

Prints text to the terminal. `\n` creates a new line.

```txt
~ > lang list
```

Shows available languages.

```txt
~ > lang pl
```

Changes the app language.

```txt
~ > clear
```

Clears the terminal output.

```txt
~ > about
```

Prints app info.

```txt
~ > exit
```

Closes the app.

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
index.html       command logic and app UI
style.css        terminal styling
main.js          Electron main process
preload.js       bridge between UI and Electron
tasks.json       saved language and tasks
lang/*.json      translations
JetBrainsMono.ttf
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

## ./credits

```txt
font: JetBrains Mono by JetBrains
ascii logo: generated with patorjk.com's Text to ASCII Art Generator
look: inspired by bash, Alacritty, and Omarchy <3
```
