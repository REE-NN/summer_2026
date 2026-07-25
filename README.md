# Задворка 2026

Семейный сайт-воспоминание о лете 2026 года в Задворке.

## Технологии

- React 19
- TypeScript
- Vite
- React Router (HashRouter)

## Запуск проекта

```bash
npm install
npm run dev          # режим разработки
```

После запуска dev-сервера сайт доступен по адресу:
`http://localhost:5173/summer_2026/`

**Content manager** — локальная служебная страница для просмотра медиа:
`http://localhost:5173/summer_2026/#/content-manager`

Content manager доступен **только в development-режиме**. В production-сборке маршрут отсутствует, переход открывает 404.

## Проверка production-сборки

```bash
npm run build          # production-сборка
npm run preview        # предпросмотр готовой сборки
```

В production-сборке content manager не включается — переход на `/content-manager` открывает страницу 404.

## Ссылки

- **Репозиторий** — [github.com/ree-nn/summer_2026](https://github.com/ree-nn/summer_2026) (исходный код, разработка)
- **GitHub Pages** — [ree-nn.github.io/summer_2026](https://ree-nn.github.io/summer_2026/) (опубликованный сайт, будет добавлен позже)

Репозиторий содержит все исходные файлы. GitHub Pages — финальная публичная версия сайта. Локальный dev-сервер используется для разработки и отладки.

## Публикация

Публикация на GitHub Pages пока не выполнена.
