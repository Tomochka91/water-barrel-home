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

function App() {
  // const proto = location.protocol === "https:" ? "wss" : "ws";
  // const { values } = useWebSocket<messageData>(
  //   `${proto}://${location.host}/ws`
  // );
  const { values, connected } = useWebSocket<messageData>(
    "ws://192.168.1.2:8000/ws"
  );
  const [label] = useState(true);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { telemetry, commands } = mapMessageToDomain(values);
  const lowWater = telemetry.waterLevel <= 30;

  return (
    <div className="container">
      {!!telemetry.waterPressure && (
        <PressureChartLive
          pressure={Number(telemetry.waterPressure.toFixed(2))}
          isMobile={isMobile}
        />
      )}
      <WaterBarrel
        value={telemetry.waterLevel}
        max={100}
        width={isMobile ? 240 : 260}
        showLabel={label}
        lowWater={lowWater}
      />
      <WaterControls commands={commands} connected={connected} />
    </div>
  );
}

export default App;
