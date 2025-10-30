import { useMemo, useId } from "react";
import styles from "./WaterBarrel.module.css";
import clsx from "clsx";

/**
 * WaterBarrel — SVG-компонент «бочка с водой» с заливкой по value и волнами.
 *
 * Отрисовывает:
 * - корпус бочки, тень и металлические обручи;
 * - внутреннюю «чашу» с заливкой от уровня;
 * - волны поверх воды (двойной слой для глубины);
 * - необязательную шкалу процентов слева;
 * - подпись с процентом (если `showLabel = true`);
 * - декоративную рыбку внутри воды;
 * - ARIA-лейбл для скринридеров.
 *
 * Геометрия:
 * - общая ширина svg = `width + scaleGutter` (если включена шкала);
 * - высота svg ≈ `width * 1.3`;
 * - внутренняя чаша определяется прямоугольником `inner` с закруглениями.
 */

type WaterBarrelProps = {
  /** Текущее значение уровня воды (0..max). По умолчанию 100. */
  value?: number;
  /** Максимальное значение шкалы (верхняя граница). По умолчанию 100. */
  max?: number;
  /** Базовая ширина бочки в пикселях (без шкалы). По умолчанию 260. */
  width?: number;
  /** Показывать подпись с процентом поверх бочки. По умолчанию true. */
  showLabel?: boolean;
  /** Основной цвет волн (переопределяет тему). */
  color?: string;
  /** Показывать левую шкалу процентов (100/75/50/25/0). По умолчанию true. */
  showScale?: boolean;
  /** Флаг «низкий уровень», подсвечивает бочку (класс `styles.low`). */
  lowWater?: boolean;
};

export function WaterBarrel({
  value = 100,
  max = 100,
  width = 260,
  showLabel = true,
  color = "var(--color-sky-bright)",
  showScale = true,
  lowWater,
}: WaterBarrelProps) {
  /** Уникальный id для clipPath; чистим от недопустимых символов для SVG. (делаем id безопасным для SVG (убираем «:» и пр.)*/
  const reactId = useId();
  const safeId = useMemo(
    () => reactId.replace(/[^a-zA-Z0-9_-]/g, "_"),
    [reactId]
  );

  /** Размеры SVG */
  const svgW = width;
  const svgH = Math.round(svgW * 1.3);

  /** Сдвиг под шкалу слева (если включена) */
  const scaleGutter = showScale ? 48 : 0; // слева место под «100%»
  const svgOuterW = width + scaleGutter; // общая ширина SVG

  /** Нормализация значения: 0..max → доля уровня 0..1 */
  const clamped = parseFloat(Math.max(0, Math.min(value, max)).toFixed(2));
  const level = clamped / max; // 0..1

  /** Геометрия внутренней чаши бочки */
  const inner = {
    x: 40,
    y: 20,
    w: svgW - 80,
    h: svgH - 60,
    rx: 26,
  };

  /** Положение воды (верх и высота заливки) */
  const waterHeight = inner.h * level;
  const waterTop = inner.y + (inner.h - waterHeight);

  /** Генерация пути волн (легкая синусоида) */
  const wavePath = useMemo(() => {
    const amp = 8; // амплитуда волны
    const len = inner.w + 80; // ширина «полосы» волны
    const step = 24;
    let d = `M 0 ${amp}`;
    for (let x = 0; x <= len; x += step) {
      const y = amp * Math.sin((x / len) * Math.PI * 2);
      d += ` L ${x} ${amp - y}`;
    }
    d += ` L ${len} ${amp + 40} L 0 ${amp + 40} Z`;
    return d;
  }, [inner.w]);

  /** Процент для подписи/ARIA */
  const percent = Math.round((clamped / max) * 100);

  /** Координаты «обручей» — используются и для рисок шкалы */
  const hoopYs = [
    inner.y - 0.5,
    inner.y + inner.h * 0.25,
    inner.y + inner.h * 0.5,
    inner.y + inner.h * 0.75,
    inner.y + inner.h + 2,
  ];

  return (
    <div className={clsx(styles.root, lowWater && styles.low)}>
      {showLabel && (
        <div className={styles.label}>
          <h1>Уровень воды в бочке:</h1>
          <div className={styles.values}>{percent}%</div>
        </div>
      )}
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

        {/* Левая шкала процентов, синхронизированная с обручами */}
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

        {/* Вся бочка сдвигается вправо на ширину поля шкалы scaleGutter */}
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
    </div>
  );
}
