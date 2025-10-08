import { useState } from "react";
import "../app/global.css";
import { WaterBarrel } from "../widgets/WaterBarrel/WaterBarrel";

function App() {
  const [val, setVal] = useState(30);
  const [label, setLabel] = useState(true);

  const lowWater = val <= 30;

  return (
    <div>
      <WaterBarrel
        value={val}
        max={100}
        width={260}
        showLabel={label}
        lowWater={lowWater}
      />

      <label>
        <span>Уровень воды:</span>
        <input
          type="range"
          min={0}
          max={100}
          value={val}
          onChange={(e) => setVal(parseInt(e.target.value, 10))}
        />
        <span>{val}%</span>
      </label>

      <label>
        <input
          type="checkbox"
          checked={label}
          onChange={(e) => setLabel(e.target.checked)}
        />
        Показывать подпись
      </label>
    </div>
  );
}

export default App;
