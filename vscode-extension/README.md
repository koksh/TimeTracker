# Time Tracker — VS Code Extension

Коротко
- Расширение собирает локальные «heartbeat» события и может отправлять их на бэкенд.

Локальная установка и разработка

1. Установите зависимости:

```bash
cd vscode-extension
npm install
```

2. Постройте расширение (компиляция TypeScript):

```bash
npm run build
```

3. Открыть в VS Code и запустить в режиме разработки (Extension Development Host):

- Откройте папку `vscode-extension` в VS Code.
- Нажмите `F5` — откроется новое окно с загруженным расширением.

Установка как .vsix (локально)

1. Установите `vsce` если нужно:

```bash
npm i -g vsce
```

2. Запакуйте в `.vsix`:

```bash
cd vscode-extension
npm run build
npx vsce package
```

3. Установите пакет в VS Code:

```bash
code --install-extension time-tracker-vscode-extension-0.1.0.vsix
```

Публикация и доступность для всех

Вариант 1 — Visual Studio Marketplace
1. Зарегистрируйте издателя на https://dev.azure.com (Visual Studio Marketplace). 
2. Создайте Personal Access Token (PAT) с правом публикации расширений.
3. Логин и публикация через `vsce`:

```bash
npx vsce login <publisher-name>
# ввести PAT
npx vsce publish
```

Вариант 2 — GitHub Releases
- Собирать `.vsix` и прикреплять к релизу — пользователи могут скачать и установить `.vsix` через `code --install-extension`.

Рекомендации
- Для отладки используйте `console.log` и `vscode.window.showInformationMessage` в коде расширения.
- Если хотите автообновления через Marketplace — используйте `vsce publish` и версионирование в `package.json`.

Файлы важные для работы
- `package.json` — метаданные и команды.
- `src/` — TypeScript исходники.
- `out/` — скомпилированный код (после `npm run build`).

Если нужно, могу добавить GitHub Actions workflow для автоматической сборки и публикации `.vsix` при релизе.