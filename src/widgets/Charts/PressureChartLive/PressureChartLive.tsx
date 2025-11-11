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

/**
 * Время, отображаемое на графике (в миллисекундах) — 60 секунд.
 */
const WINDOW_MS = 60_000;

/**
 * Форматирование времени для оси X и подсказок.
 *
 * @param t - timestamp в миллисекундах
 * @returns строка формата `HH:MM:SS`
 */
const formatTime = (t: number) =>
  new Date(t).toLocaleTimeString([], {
    hour12: false,
  });

/**
 * Пропсы компонента PressureChartLive.
 */
type PressureProps = {
  /** Текущее давление (бар) */
  pressure: number | null;
  /** Текущее давление (бар) после фильтров */
  pressureAfterFilter: number | null;
  /** Флаг мобильного режима для адаптации размеров и шрифта */
  isMobile: boolean;
};

/**
 * Компонент отображает живой график давления воды за последние 60 секунд.
 *
 * При каждом обновлении `pressure` добавляется новая точка на графике.
 * Данные за пределами окна (60 секунд) автоматически отбрасываются.
 *
 * Адаптируется под мобильные экраны, изменяя высоту и размер шрифта.
 *
 * @example
 * ```tsx
 * <PressureChartLive pressure={telemetry.waterPressure} isMobile={isMobile} />
 * ```
 */
export function PressureChartLive({
  pressure,
  pressureAfterFilter,
  isMobile,
}: PressureProps) {
  /** Состояние данных для графика: массив точек (время, давление) */
  const [data, setData] = useState<
    Array<{ t: number; pr: number; prF: number }>
  >([]);

  /** Добавляем новую точку при каждом изменении давления */
  useEffect(() => {
    if (pressure === null || pressureAfterFilter === null) return;

    const now = Date.now();
    setData((prev) => {
      const next = [
        ...prev,
        { t: now, pr: pressure, prF: pressureAfterFilter },
      ];
      // Оставляем только точки в пределах последней минуты
      const cutoff = now - WINDOW_MS;
      return next.filter((p) => p.t >= cutoff);
    });
  }, [pressure, pressureAfterFilter]);

  /** Временные границы окна (xDomain) */
  const lastT = data.length ? data[data.length - 1].t : Date.now();
  const start = lastT - WINDOW_MS;

  /** Точки отметок оси X: каждые 20 секунд */
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
          {/* Сетка */}
          <CartesianGrid strokeDasharray="3 3" stroke="var(--cartesian-grid)" />
          {/* Ось X — время */}
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
          {/* Ось Y — давление */}
          <YAxis
            domain={[0, 4]}
            tick={{
              fill: "var(--label-color)",
              ...(isMobile
                ? { fontSize: 10, dy: -2 }
                : { fontSize: 16, dy: -4 }),
            }}
          />
          {/* Подсказка при наведении */}
          <Tooltip
            labelFormatter={(t) => `Время: ${formatTime(Number(t))}`}
            formatter={(v: number) => [`${v.toFixed(2)} бар`, "Давление"]}
            contentStyle={{ borderRadius: 8 }}
          />
          {/* Линия давления */}
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
          {/* Линия давления после фильтров*/}
          <Line
            type="monotone"
            dataKey="prF"
            stroke="var(--pressure-line-after-filter)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            activeDot={{
              r: 2,
              fill: "var(--pressure-line-after-filter)",
              stroke: "var(--color-sand-light)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
