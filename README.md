# 💧 WaterBarrel

Интерактивный интерфейс мониторинга и управления системой водоснабжения.  
Отображает **уровень воды**, **давление**, и позволяет **включать/выключать насосы и автоматику** через OPC-сервер.

---

## 🚀 Возможности

- 📡 Подключение к **WebSocket** для телеметрии в реальном времени
- ⚙️ Отправка управляющих команд через REST API (`/api/write`)
- 💧 SVG-бочка с волнами, шкалой и рыбкой 🐟
- 📈 Живой график давления за последние 60 секунд
- 📱 Адаптивный интерфейс под мобильные устройства
- 🔄 Автоматическое восстановление соединения при обрыве

---

## 🧱 Структура проекта

```text
src/
 ├─ hooks/
 │   ├─ useWebSocket.ts       → получение данных от WebSocket
 │   └─ useOpcWriter.ts       → отправка команд на OPC-сервер
 │
 ├─ data/
 │   ├─ mapMessageToDomain.ts → преобразование «сырых» данных в domain-модель
 │   └─ labels.ts             → читаемые подписи для кнопок
 │
 ├─ widgets/
 │   ├─ PressureChartLive/    → живой график давления
 │   ├─ WaterBarrel/          → SVG-бочка с водой
 │   └─ WaterControls/        → панель управления насосами
 │
 ├─ App.tsx                   → главный компонент приложения
 └─ index.tsx / main.tsx      → точка входа
```

---

## ⚡️ Основные компоненты

| Компонент              | Назначение                                              |
| ---------------------- | ------------------------------------------------------- |
| **App**                | Корневой компонент приложения                           |
| **PressureChartLive**  | Живой график давления за последние 60 секунд            |
| **WaterBarrel**        | SVG-бочка с водой, волнами и шкалой                     |
| **WaterControls**      | Панель управления насосами и автоматикой                |
| **useWebSocket**       | Хук подключения к WebSocket-серверу                     |
| **useOpcWriter**       | Хук отправки команд на OPC REST API                     |
| **mapMessageToDomain** | Преобразует данные в структуру `telemetry` и `commands` |

---

## 🔌 Настройка окружения

1. **Установить зависимости**

   ```bash
   npm install
   # или
   pnpm install
   ```

2. **В файле App.tsx при необходимости заменить строку:**

   ```
   const { values, connected } = useWebSocket("ws://192.168.1.2:8000/ws");

   или вернуть автоматическое определение протокола:

   const proto = location.protocol === "https:" ? "wss" : "ws";
   const { values, connected } = useWebSocket(`${proto}://${location.host}/ws`);
   ```

3. **Запустить проект**

   ```
   npm run dev
   ```

---

## 🔌 Логика данных

**📥 Входящие сообщения с сервера**

      {
        "WS_LE1_VAL": 52.07,
        "WS_PE1_VAL": 2.59,
        "enable_P1_cmd": true
      }

**🔁 После преобразования через mapMessageToDomain**

      {
        telemetry: { waterLevel: 52.07, waterPressure: 2.59 },
        commands: { enable_P1_cmd: true }
      }

**🧩 Использование в App**

```
<PressureChartLive pressure={telemetry.waterPressure} isMobile={isMobile} />
<WaterBarrel value={telemetry.waterLevel} lowWater={telemetry.waterLevel <= 30} />
<WaterControls commands={commands} connected={connected} />
```

## 🛠️ Технологии

| Технология                   | Использование                      |
| :--------------------------- | :--------------------------------- |
| ⚛️ **React + TypeScript**    | Основная платформа                 |
| ⚡ **Vite**                  | Быстрая dev-сборка                 |
| 📈 **Recharts**              | График давления                    |
| 🎨 **CSS Modules**           | Изолированные стили компонентов    |
| 🌐 **WebSocket + Fetch API** | Связь с сервером (реалтайм и REST) |
