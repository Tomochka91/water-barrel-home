import { useMemo, useId } from "react";
import styles from "./WaterBarrel.module.css";
import clsx from "clsx";

/**
 * WaterBarrel — SVG-компонент «бочка с водой» с заливкой по value и рыбкой
 *
 * Props:
 *  - value: число текущего уровня (0..max)
 *  - max: верхняя граница шкалы (по умолчанию 100)
 *  - width: ширина SVG в px (по умолчанию 260)
 *  - showLabel: показывать процент/значение (boolean)
 *  - color: основной цвет воды
 */

type WaterBarrelProps = {
  value?: number;
  max?: number;
  width?: number;
  showLabel?: boolean;
  /** основной цвет волн (перекрывает тему) */
  color?: string;
  showScale?: boolean;
  lowWater?: boolean;
};

export function WaterBarrel({
  value = 40,
  max = 100,
  width = 260,
  showLabel = true,
  color = "var(--color-sky-bright)",
  showScale = true,
  lowWater,
}: WaterBarrelProps) {
  const reactId = useId();
  // делаем id безопасным для SVG (убираем «:» и пр.)
  const safeId = useMemo(
    () => reactId.replace(/[^a-zA-Z0-9_-]/g, "_"),
    [reactId]
  );

  const svgW = width;
  const svgH = Math.round(svgW * 1.3);

  const scaleGutter = showScale ? 48 : 0; // слева место под «100%»
  const svgOuterW = width + scaleGutter; // общая ширина SVG

  const clamped = Math.max(0, Math.min(value, max));
  const level = clamped / max; // 0..1

  // Геометрия внутренней области бочки (куда будет заливаться вода)
  const inner = {
    x: 40,
    y: 20,
    w: svgW - 80,
    h: svgH - 60,
    rx: 26,
  };

  // Высота воды с учётом уровня
  const waterHeight = inner.h * level;
  const waterTop = inner.y + (inner.h - waterHeight);

  // Волны (генерация синусоподобного пути)
  const wavePath = useMemo(() => {
    const amp = 8; // амплитуда волны
    const len = inner.w + 80; // длина дорожки волны
    const step = 24;
    let d = `M 0 ${amp}`;
    for (let x = 0; x <= len; x += step) {
      const y = amp * Math.sin((x / len) * Math.PI * 2);
      d += ` L ${x} ${amp - y}`;
    }
    d += ` L ${len} ${amp + 40} L 0 ${amp + 40} Z`;
    return d;
  }, [inner.w]);

  const percent = Math.round((clamped / max) * 100);

  // Для обручей и шкалы
  const hoopYs = [
    inner.y - 0.5,
    inner.y + inner.h * 0.25,
    inner.y + inner.h * 0.5,
    inner.y + inner.h * 0.75,
    inner.y + inner.h + 2,
  ];

  return (
    <div className={clsx(styles.root, lowWater && styles.low)}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${svgOuterW} ${svgH}`}
        width={svgOuterW}
        height={svgH}
        role="img"
        aria-label={`Уровень воды в бочке: ${percent}%`}
      >
        {/* Определения: клип для внутренней формы бочки и градиенты 
        — определение формы-ограничителя (хранится в <defs>, не рисуется)*/}
        <defs>
          <clipPath id={`barrel-clip-${safeId}`}>
            <rect
              x={inner.x}
              y={inner.y}
              width={inner.w}
              height={inner.h}
              rx={inner.rx}
              ry={inner.rx}
            />
          </clipPath>
        </defs>

        {/* Шкала слева на уровнях обручей */}
        {showScale && (
          <g className={styles.scale} aria-hidden="true">
            {hoopYs.map((y, i) => {
              // центр обруча (высота 4px → +2)
              const yc = y + 2;
              // проценты сверху вниз: 100, 75, 50, 25, 0
              const percents = [100, 75, 50, 25, 0][i];
              // координаты шкалы слева от внешней рамки бочки
              // край левого борта бочки = scaleGutter + (inner.x - 14)
              // риску ставим немного левее борта (на 2px–6px)
              const tickX2 = scaleGutter + inner.x - 16;
              const tickX1 = tickX2 - 6;
              const textX = tickX1 - 6; // текст выравниваем по правому краю к риске

              return (
                <g key={`scale-${i}`}>
                  <line
                    className={styles.scaleTick}
                    x1={tickX1}
                    y1={yc}
                    x2={tickX2}
                    y2={yc}
                  />
                  <text
                    className={styles.scaleText}
                    x={textX}
                    y={yc}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {percents}%
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* ВСЮ БОЧКУ СДВИГАЕМ ВПРАВО НА scaleGutter */}
        <g transform={`translate(${scaleGutter} 0)`}>
          {/* Тень под бочкой */}
          <ellipse
            className={styles.shadow}
            cx={svgW / 2}
            cy={svgH - 10}
            rx={inner.w / 2}
            ry={10}
          />

          {/* Корпус бочки (фон) */}
          <rect
            className={styles.barrel}
            x={inner.x - 14}
            y={inner.y - 10}
            width={inner.w + 28}
            height={inner.h + 20}
            rx={inner.rx + 10}
          />

          {/* Металлические обручи */}
          {hoopYs.map((y, i) => (
            <rect
              className={styles.hoop}
              key={i}
              x={inner.x - 14}
              y={y}
              width={inner.w + 28}
              height={4}
              rx={4}
              opacity={i === 0 || i === 4 ? 1 : 0.6}
            />
          ))}

          {/* ВНУТРЕННЯЯ ЧАСТЬ: вода обрезается формой бочки 
        — применение формы clipPath id={`barrel-clip-${safeId}`} как «маски» к группе/элементу */}
          <g clipPath={`url(#barrel-clip-${safeId})`}>
            {/* Статический слой воды */}
            <rect
              className={styles.water}
              x={inner.x}
              y={waterTop}
              width={inner.w}
              height={waterHeight}
            />

            {/* Волны поверх воды */}
            <g transform={`translate(${inner.x - 40} ${waterTop - 12})`}>
              <path
                className={styles.wave1}
                d={wavePath}
                fill={color}
                opacity="0.55"
              />
              <path
                className={styles.wave2}
                d={wavePath}
                fill={color}
                opacity="0.35"
                transform="translate(-80 6) scale(1.05 0.95)"
              />
            </g>

            {/* Рыбка */}
            <g
              transform={`translate(${inner.x + inner.w / 2} ${
                waterTop + waterHeight / 2
              })`}
            >
              <g className={styles.fish}>
                <ellipse
                  className={styles.fishBody}
                  cx="0"
                  cy="0"
                  rx="16"
                  ry="10"
                />
                <polygon
                  className={styles.fishTail}
                  points="-16,0 -28,-8 -28,8"
                />
                <circle className={styles.fishEye} cx="6" cy="-2" r="2" />
              </g>
            </g>
          </g>

          {/* Контур внутренней части для чёткости краёв воды */}
          <rect
            x={inner.x}
            y={inner.y}
            width={inner.w}
            height={inner.h}
            rx={inner.rx}
            fill="none"
            stroke="var(--color-sky-dark-thunder)"
            strokeWidth={1.2}
            opacity="0.7"
          />
        </g>
      </svg>

      {showLabel && (
        <div className={styles.label}>
          Уровень: {clamped}/{max} ({percent}%)
        </div>
      )}
    </div>
  );
}
