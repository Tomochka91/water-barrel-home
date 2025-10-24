import { useState } from "react";
import "../app/global.css";
import { WaterBarrel } from "../widgets/WaterBarrel/WaterBarrel";
import {
  mapMessageToWaterData,
  type messageData,
} from "../shared/mappers/websocketMapper";
import { useWebSocket } from "../shared/hooks/useWebSocket";
import { useMediaQuery } from "react-responsive";
import { PressureChartLive } from "../widgets/Charts/PressureChartLive/PressureChartLive";
import { WaterControls } from "../widgets/WaterControls/WaterControls";
import clsx from "clsx";

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

  const waterValues = mapMessageToWaterData(values);
  const lowWater = waterValues.waterLevel <= 30;

  return (
    <div className="container">
      {waterValues.waterPressure && (
        <PressureChartLive
          pressure={Number(waterValues.waterPressure.toFixed(2))}
        />
      )}
      <WaterBarrel
        value={waterValues.waterLevel}
        max={100}
        width={isMobile ? 240 : 260}
        showLabel={label}
        lowWater={lowWater}
      />

      {/* {waterValues.waterPressure && (
        <p>Давление: {waterValues.waterPressure.toFixed(2)}</p>
      )} */}
      {/* <WaterControls values={values} connected={connected} /> */}
    </div>
  );
}

export default App;
