import { useState } from "react";
import "../app/global.css";
import { WaterBarrel } from "../widgets/WaterBarrel/WaterBarrel";
import {
  mapMessageToDomain,
  type messageData,
} from "../shared/mappers/websocketMapper";
import { useWebSocket } from "../shared/hooks/useWebSocket";
import { useMediaQuery } from "react-responsive";
import { PressureChartLive } from "../widgets/Charts/PressureChartLive/PressureChartLive";
import { WaterControls } from "../widgets/WaterControls/WaterControls";

/**
 * Главный компонент приложения WaterBarrel.
 *
 * Основные задачи:
 * - Подключение к WebSocket серверу для получения данных телеметрии.
 * - Преобразование полученных данных в удобную структуру (через mapMessageToDomain).
 * - Отображение текущего давления, уровня воды и панели управления.
 */

function App() {
  /**
   * Подключение к WebSocket.
   *
   * Протокол выбирается динамически в зависимости от HTTPS или HTTP,
   * Для тестов используется фиксированный адрес:
   * ws://192.168.1.2:8000/ws
   */

  const proto = location.protocol === "https:" ? "wss" : "ws";
  const { values, connected } = useWebSocket<messageData>(
    `${proto}://${location.host}/ws`
  );
  // const { values, connected } = useWebSocket<messageData>(
  //   "ws://192.168.1.2:8000/ws"
  // );

  /** Флаг отображения подписей (уровень воды в процентах) */
  const [label] = useState(true);

  /** Определяем, используется ли мобильный экран (ширина ≤ 768px) */
  const isMobile = useMediaQuery({ maxWidth: 768 });

  /**
   * Преобразуем «сырые» значения WebSocket в структурированные данные.
   * telemetry — данные сенсоров (уровень воды, давление и т.п.)
   * commands — доступные управляющие команды.
   */
  const { telemetry, commands } = mapMessageToDomain(values);

  /** Считаем, что уровень воды низкий, если ≤ 30% */
  const lowWater = telemetry.waterLevel <= 30;

  return (
    <div className="container">
      {/* График давления воды (рендерится, только если есть данные) */}
      {!!telemetry.waterPressure && (
        <PressureChartLive
          pressure={Number(telemetry.waterPressure.toFixed(2))}
          isMobile={isMobile}
        />
      )}
      {/* Визуализация уровня воды */}
      <WaterBarrel
        value={telemetry.waterLevel}
        max={100}
        width={isMobile ? 240 : 260}
        showLabel={label}
        lowWater={lowWater}
      />
      {/* Панель управления насосами и автоматикой */}
      <WaterControls commands={commands} connected={connected} />
    </div>
  );
}

export default App;
