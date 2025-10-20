import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

// сколько времени держим на экране (60 секунд)
const WINDOW_MS = 60_000;

// Форматируем время
const formatTime = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour12: false });

type PressureProps = {
  pressure: number | null;
};

export function PressureChartLive({ pressure }: PressureProps) {
  const [data, setData] = useState<Array<{ t: number; pr: number }>>([]);

  // добавляем точку при каждом обновлении давления
  useEffect(() => {
    if (pressure === null) return;

    const now = Date.now();
    setData((prev) => {
      const next = [...prev, { t: now, pr: pressure }];

      // держим только окно последних WINDOW_MS
      const cutoff = now - WINDOW_MS;
      return next.filter((p) => p.t >= cutoff);
    });
  }, [pressure]);

  const xDomain = useMemo<[number | "dataMin", number | "dataMax"]>(() => {
    return ["dataMin", "dataMax"];
  }, []);

  return (
    <div style={{ width: 320, height: 320 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--cartesian-grid)" />
          <XAxis
            dataKey="t"
            type="number"
            domain={xDomain}
            tickFormatter={(t) => formatTime(Number(t))}
            // чтобы метки не наслаивались при маленькой ширине
            minTickGap={24}
            tick={{ fontSize: 16, fill: "var(--label-color)" }}
          />
          <YAxis
            domain={[0, 4]}
            tick={{ fontSize: 16, fill: "var(--label-color)" }}
          />
          <Tooltip
            labelFormatter={(t) => `Время: ${formatTime(Number(t))}`}
            formatter={(v: number) => [`${v.toFixed(2)} бар`, "Давление"]}
            contentStyle={{ borderRadius: 8 }}
          />
          <Line
            type="monotone"
            dataKey="pr"
            stroke="var(--pressure-line)"
            strokeWidth={2}
            dot={false} // без точек — чище при частых апдейтах
            isAnimationActive={false} // для стрима анимацию лучше выключить
            activeDot={{
              r: 2,
              fill: "var(--pressure-line)",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          >
            <LabelList
              dataKey="pr"
              position="top"
              offset={8}
              fill="var(--color-rose-dark)"
              fontSize={12}
              // formatter={(v) => v.toFixed(2)} // формат числа
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
