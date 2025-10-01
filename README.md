# LCT Hackaton Frontend - Медицинский мониторинг

Фронтенд приложение для мониторинга медицинских данных в реальном времени с использованием WebSocket.

## 🚀 Технологии

- **Next.js 15.5** - React фреймворк с App Router
- **TypeScript** - Строгая типизация
- **Zustand** - Управление состоянием
- **Tailwind CSS 4** - Стилизация
- **WebSocket** - Передача данных в реальном времени
- **shadcn/ui** - UI компоненты

## 📡 WebSocket интеграция

Проект включает полную поддержку WebSocket для трех типов данных:

- **AI Socket** - Анализ данных искусственным интеллектом
- **BPM Socket** - Частота сердцебиения (beats per minute)
- **UC Socket** - Сокращения матки (uterine contractions)

### Быстрый старт с WebSocket

```tsx
"use client";

import { useAllWebSockets, useLastBPMMessage } from "@/shared";

export function Monitor() {
  const { connectAll, allConnected } = useAllWebSockets();
  const lastBPM = useLastBPMMessage();

  return (
    <div>
      <button onClick={connectAll}>Подключиться</button>
      {lastBPM && <p>BPM: {lastBPM.value}</p>}
    </div>
  );
}
```

📚 **Подробная документация:**

- [WebSocket Guide](./WEBSOCKET_GUIDE.md) - Полное руководство
- [Example Usage](./EXAMPLE_USAGE.md) - Примеры использования

## 📁 Структура проекта (FSD)

```
src/
├── app/              # Next.js App Router
├── features/         # Функциональности (monitoring)
├── entities/         # Бизнес-сущности
├── widgets/          # Композитные блоки
└── shared/           # Общий слой
    ├── api/          # WebSocket клиенты
    ├── types/        # TypeScript типы
    ├── store/        # Zustand stores
    ├── hooks/        # React хуки
    ├── components/   # UI компоненты
    └── config/       # Конфигурация
```

## ⚙️ Конфигурация

Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_WS_AI_URL=ws://your-server.com/ws/ai
NEXT_PUBLIC_WS_BPM_URL=ws://your-server.com/ws/bpm
NEXT_PUBLIC_WS_UC_URL=ws://your-server.com/ws/uc
```

## Getting Started

### Установка

```bash
npm install
```

### Запуск сервера разработки

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
