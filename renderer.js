const logo = document.querySelector('.logo');
const commandsend = document.querySelector('.command-send');
const commandinput = document.querySelector('.command-input');
const terminal = document.querySelector('.terminal');
const todolist = document.querySelector('.ToDoList');
const tasklist = [];
let lang = {};
let currentLanguage = 'en';
let lastCopiedSelection = '';
let copySelectionTimeout;

window.addEventListener("load", async () => {
    await load();
    await loadLang(currentLanguage);
    applyLang();
    window.scrollTo(0, document.body.scrollHeight);
});

function t(key){
  return lang[key] || key;
}

async function loadLang(languageCode = 'en'){
  if (window.appApi) {
    lang = await window.appApi.loadLang(languageCode);
    currentLanguage = languageCode;
    return;
  }

  const response = await fetch(`lang/${languageCode}.json`);
  if (!response.ok) {
    throw new Error('Language not found');
  }
  lang = await response.json();
  currentLanguage = languageCode;
}

function applyLang(){
  document.title = t('appTitle');
  logo.textContent = t('logo');
  commandinput.placeholder = t('commandPlaceholder');
  commandsend.textContent = t('commandSendLabel');
  renderTasks();
}

async function listLanguages(){
  if (window.appApi) {
    return window.appApi.listLangs();
  }

  return ['en', 'pl', 'es', 'de', 'fr'];
}

function appendTerminalLine(text){
  const line = document.createElement('p');
  line.textContent = text;
  terminal.appendChild(line);
}

function copyTextToClipboard(text){
  if (window.appApi) {
    window.appApi.copyText(text);
    return;
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

function copySelectionToClipboard(){
  clearTimeout(copySelectionTimeout);
  copySelectionTimeout = setTimeout(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const selectedText = selection.toString();
    if (selectedText.trim() === '' || selectedText === lastCopiedSelection) {
      return;
    }

    lastCopiedSelection = selectedText;
    copyTextToClipboard(selectedText);
  }, 50);
}

async function changeLanguage(languageCode){
  const languages = await listLanguages();

  if (!/^[a-z]{2}$/.test(languageCode)) {
    appendTerminalLine(t('langInvalidCode'));
    return;
  }

  if (!languages.includes(languageCode)) {
    appendTerminalLine(t('langNotFoundPrefix') + languageCode + t('lineBreaks'));
    return;
  }

  await loadLang(languageCode);
  applyLang();
  save();
  appendTerminalLine(t('langChangedPrefix') + currentLanguage + t('lineBreaks'));
}

function save(){
  if (!window.appApi) {
    return;
  }

  window.appApi.saveTasks({
    lang: currentLanguage,
    tasks: tasklist
  }).catch(() => {
    const errorLine = document.createElement('p');
    errorLine.textContent = t('saveError');
    terminal.appendChild(errorLine);
  });
}

async function load(){
  if (!window.appApi) {
    return;
  }

  return window.appApi.loadTasks().then((data) => {
    const tasks = Array.isArray(data) ? data : data.tasks;

    if (!Array.isArray(data) && data && /^[a-z]{2}$/.test(data.lang)) {
      currentLanguage = data.lang;
    }

    tasklist.length = 0;
    if (Array.isArray(tasks)) {
      tasklist.push(...tasks.map((task) => {
        if (typeof task === 'string') {
          return {
            text: task,
            done: false
          };
        }

        return {
          text: task.text,
          done: Boolean(task.done)
        };
      }));
    }
    renderTasks();
  }).catch(() => {
    const errorLine = document.createElement('p');
    errorLine.textContent = t('loadError');
    terminal.appendChild(errorLine);
  });
}

function renderTasks(){
  todolist.innerHTML = '';
  const title = document.createElement('h3');
  title.textContent = t('tasksTitle');
  todolist.appendChild(title);

  if (tasklist.length === 0) {
    const emptyLine = document.createElement('p');
    emptyLine.textContent = t('tasksEmpty');
    todolist.appendChild(emptyLine);
    return;
  }

  tasklist.forEach((task, index) => {
      const tLine = document.createElement('p');
      const status = document.createElement('span');

      status.className = task.done ? 'task-status-done' : 'task-status-undone';
      status.textContent = task.done ? t('statusDone') : t('statusUndone');
      tLine.appendChild(document.createTextNode(`${index + 1}. [`));
      tLine.appendChild(status);
      tLine.appendChild(document.createTextNode(`] ${task.text}`));
      todolist.appendChild(tLine);
  });
}

async function main(){
  const command = commandinput.value;
  const normalizedCommand = command.trim().toLowerCase();
  if (command == '') return;
  const newLine = document.createElement('p');
  const cursor = document.createElement('span');

  cursor.className = 'cursor';
  cursor.textContent = t('commandPrefix');
  newLine.appendChild(cursor);
  newLine.appendChild(document.createTextNode(command));
  terminal.appendChild(newLine);
  commandinput.value = '';
  if (normalizedCommand == "help"){
    const helpLine = document.createElement('p');
    helpLine.textContent = t('helpText');
    terminal.appendChild(helpLine);
  } 
  else if (normalizedCommand == "clear"){
    terminal.innerHTML = '';
  } 
  else if (normalizedCommand == "exit"){
    if (window.appApi) {
      window.appApi.exit();
    }
  } 
  else if (normalizedCommand == "about"){
    const aboutLine = document.createElement('p');
    aboutLine.textContent = t('aboutText');

    terminal.appendChild(aboutLine);

  }
  else if (normalizedCommand.startsWith("echo")) {
      appendTerminalLine(command.slice(4).trim().replace(/\\n/g, '\n') + t('lineBreaks'));
  }
  else if (normalizedCommand.startsWith("copy")) {
      const taskIndex = parseInt(normalizedCommand.slice(4).trim()) - 1;
      if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= tasklist.length) {
          const errorLine = document.createElement('p');
          errorLine.textContent = t('invalidTaskIndexError');
          terminal.appendChild(errorLine);
          return;
      }

      copyTextToClipboard(tasklist[taskIndex].text);
      const sucLine = document.createElement('p');
      sucLine.textContent = t('taskCopied');
      terminal.appendChild(sucLine);
  }
  else if (normalizedCommand.startsWith("lang")) {
      const languageArgument = normalizedCommand.slice(4).trim();

      if (languageArgument === "list") {
        const languages = await listLanguages();
        appendTerminalLine(t('langListPrefix') + languages.join(', ') + t('lineBreaks'));
        return;
      }

      if (languageArgument === "") {
        appendTerminalLine(t('langUsage'));
        return;
      }

      await changeLanguage(languageArgument);
  }
  else if (normalizedCommand.startsWith("addtask")) {
      const task = command.slice(8).trim();
      if (task === "") {
        const errorLine = document.createElement('p');
        errorLine.textContent = t('taskEmptyError');
        terminal.appendChild(errorLine);
        return;
      }
      if (task) {
        tasklist.push({
          text: task,
          done: false
        });
        save();
        renderTasks();
      }
        const sucLine = document.createElement('p');
        sucLine.textContent = t('taskAdded');
        terminal.appendChild(sucLine);
  } else if (normalizedCommand.startsWith("removetask")) {
      const taskIndex = parseInt(normalizedCommand.slice(10).trim()) - 1;
      if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= tasklist.length) {
          const errorLine = document.createElement('p');
          errorLine.textContent = t('invalidTaskIndexError');
          terminal.appendChild(errorLine);
          return;
      }
      const sucLine = document.createElement('p');
      sucLine.textContent = t('taskRemoved');
      terminal.appendChild(sucLine);
      tasklist.splice(taskIndex, 1);
      save();
      renderTasks();
  } else if (normalizedCommand.startsWith("edit")) {
      const editParts = command.trim().split(/\s+/);
      const taskIndex = parseInt(editParts[1]) - 1;
      const newText = editParts.slice(2).join(' ');

      if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= tasklist.length) {
          const errorLine = document.createElement('p');
          errorLine.textContent = t('invalidTaskIndexError');
          terminal.appendChild(errorLine);
          return;
      }

      if (newText === "") {
        const errorLine = document.createElement('p');
        errorLine.textContent = t('taskEmptyError');
        terminal.appendChild(errorLine);
        return;
      }

      tasklist[taskIndex].text = newText;
      save();
      renderTasks();
      const sucLine = document.createElement('p');
      sucLine.textContent = t('taskEdited');
      terminal.appendChild(sucLine);
  } else if (normalizedCommand.startsWith("move")) {
      const moveParts = normalizedCommand.split(/\s+/);
      const fromIndex = parseInt(moveParts[1]) - 1;
      const toIndex = parseInt(moveParts[2]) - 1;

      if (isNaN(fromIndex) || fromIndex < 0 || fromIndex >= tasklist.length || isNaN(toIndex) || toIndex < 0 || toIndex >= tasklist.length) {
          const errorLine = document.createElement('p');
          errorLine.textContent = t('invalidTaskIndexError');
          terminal.appendChild(errorLine);
          return;
      }

      const movedTask = tasklist.splice(fromIndex, 1)[0];
      tasklist.splice(toIndex, 0, movedTask);
      save();
      renderTasks();
      const sucLine = document.createElement('p');
      sucLine.textContent = t('taskMoved');
      terminal.appendChild(sucLine);
  } else if (normalizedCommand.startsWith("done")) {
      const taskIndex = parseInt(normalizedCommand.slice(4).trim()) - 1;
      if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= tasklist.length) {
          const errorLine = document.createElement('p');
          errorLine.textContent = t('invalidTaskIndexError');
          terminal.appendChild(errorLine);
          return;
      }
      tasklist[taskIndex].done = true;
      save();
      renderTasks();
      const sucLine = document.createElement('p');
      sucLine.textContent = t('taskDone');
      terminal.appendChild(sucLine);
  } else if (normalizedCommand.startsWith("undone")) {
      const taskIndex = parseInt(normalizedCommand.slice(6).trim()) - 1;
      if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= tasklist.length) {
          const errorLine = document.createElement('p');
          errorLine.textContent = t('invalidTaskIndexError');
          terminal.appendChild(errorLine);
          return;
      }
      tasklist[taskIndex].done = false;
      save();
      renderTasks();
      const sucLine = document.createElement('p');
      sucLine.textContent = t('taskUndone');
      terminal.appendChild(sucLine);
  }
  else{
    const errorLine = document.createElement('p');
    errorLine.textContent = t('commandNotFoundPrefix') + command + t('lineBreaks');
    terminal.appendChild(errorLine);
  }
}

document.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await main();
        window.scrollTo(0, document.body.scrollHeight);
    }else{
      commandinput.focus();
    }
});

commandsend.addEventListener('click', async () => {
    await main()
    window.scrollTo(0, document.body.scrollHeight);
});

document.addEventListener('mouseup', copySelectionToClipboard);
