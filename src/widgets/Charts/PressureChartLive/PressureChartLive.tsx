import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import styles from "./PressureChartLive.module.css";

// сколько времени держим на экране (60 секунд)
const WINDOW_MS = 60_000;

// Форматируем время
const formatTime = (t: number) =>
  new Date(t).toLocaleTimeString([], {
    hour12: false,
  });

type PressureProps = {
  pressure: number | null;
  isMobile: boolean;
};

export function PressureChartLive({ pressure, isMobile }: PressureProps) {
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

  // Привязываемся к последнему таймстемпу данных
  const lastT = data.length ? data[data.length - 1].t : Date.now();
  const start = lastT - WINDOW_MS;

  // Ровно 4 отметки: старт, +20с, +40с, сейчас
  const xDomain: [number, number] = [start, lastT];
  const xTicks = [start, start + 20_000, start + 40_000, lastT];

  return (
    <div className={styles.container}>
      <ResponsiveContainer height={isMobile ? 200 : 320}>
        <LineChart
          data={data}
          margin={
            isMobile
              ? { top: 0, right: 28, bottom: 16, left: -24 }
              : { top: 16, right: 40, bottom: 16, left: 0 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--cartesian-grid)" />
          <XAxis
            dataKey="t"
            type="number"
            domain={xDomain}
            ticks={xTicks}
            tickFormatter={(t) => formatTime(Number(t))}
            interval={0} // рисовать все тики
            allowDataOverflow // не обрезать линию у границ
            tick={{
              fill: "var(--label-color)",
              ...(isMobile ? { fontSize: 10, dy: 2 } : { fontSize: 16, dy: 4 }),
            }}
          />
          <YAxis
            domain={[0, 4]}
            tick={{
              fill: "var(--label-color)",
              ...(isMobile
                ? { fontSize: 10, dy: -2 }
                : { fontSize: 16, dy: -4 }),
            }}
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
              stroke: "var(--color-gold-bright)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
