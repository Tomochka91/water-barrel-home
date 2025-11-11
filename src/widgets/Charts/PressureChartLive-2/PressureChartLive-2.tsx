import { useEffect, useMemo, useRef } from "react";
import styles from "./PressureChartLive-2.module.css";
import * as echarts from "echarts/core";

import { LineChart, type LineSeriesOption } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  type GridComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type {
  ComposeOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from "echarts";
import clsx from "clsx";

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

type ECOption = ComposeOption<
  | LineSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | XAXisComponentOption
  | YAXisComponentOption
>;

/** 60 секунд окна в мс */
const WINDOW_MS = 60_000;

type PressureProps = {
  pressure: number | null;
  pressureAfterFilter: number | null;
  isMobile: boolean;
};

const formatTime = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour12: false });

export function PressureChartLiveEcharts({
  pressure,
  pressureAfterFilter,
  isMobile,
}: PressureProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  // Храним массивы вне React-состояния — без лишних ререндеров
  const dataRef = useRef<{ pr: [number, number][]; prF: [number, number][] }>({
    pr: [],
    prF: [],
  });

  // Базовая опция (строго типизирована ECOption)
  const baseOption = useMemo<ECOption>(() => {
    const fontSize = isMobile ? 10 : 14;
    const now = Date.now();

    return {
      animation: false,
      backgroundColor: "transparent",
      grid: isMobile
        ? { top: 8, right: 16, bottom: 24, left: 8 }
        : { top: 16, right: 28, bottom: 28, left: 16 },
      tooltip: {
        trigger: "axis",
        confine: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const x = params?.[0]?.axisValue as number;
          const lines = params
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => {
              const name = p.seriesName;
              const val =
                typeof p.data?.[1] === "number" ? p.data[1].toFixed(2) : "-";
              return `${name}:${val} бар`;
            })
            .join("<br/>");
          return `Время: ${formatTime(x)}<br/>${lines}`;
        },
      },
      xAxis: {
        type: "time",
        min: now - WINDOW_MS,
        max: now,
        axisLabel: { formatter: (v: number) => formatTime(v), fontSize },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 4,
        axisLabel: { fontSize },
      },
      series: [
        {
          id: "pr",
          name: "Давление",
          type: "line",
          showSymbol: false,
          sampling: "lttb",
          lineStyle: { width: 2 },
          data: [],
          progressive: 2000,
        },
        {
          id: "prF",
          name: "После фильтров",
          type: "line",
          showSymbol: false,
          sampling: "lttb",
          lineStyle: { width: 2 },
          data: [],
          progressive: 2000,
        },
      ],
    };
  }, [isMobile]);

  // init / dispose
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = echarts.init(containerRef.current, undefined, {
      renderer: "canvas",
      devicePixelRatio: 2,
    });
    chart.setOption(baseOption, true);
    chartRef.current = chart;

    const resizeObs = new ResizeObserver(() => chart.resize());
    resizeObs.observe(containerRef.current);

    return () => {
      resizeObs.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [baseOption]);

  // поток обновлений
  useEffect(() => {
    if (pressure === null || pressureAfterFilter === null) return;

    const t = Date.now();
    const { pr, prF } = dataRef.current;

    pr.push([t, pressure]);
    prF.push([t, pressureAfterFilter]);

    const cutoff = t - WINDOW_MS;
    while (pr.length && pr[0][0] < cutoff) pr.shift();
    while (prF.length && prF[0][0] < cutoff) prF.shift();

    const chart = chartRef.current;
    if (!chart) return;

    chart.setOption(
      {
        xAxis: { min: cutoff, max: t },
        series: [
          { id: "pr", data: pr },
          { id: "prF", data: prF },
        ],
      } as ECOption,
      false,
      true
    );
  }, [pressure, pressureAfterFilter]);

  return (
    <div
      ref={containerRef}
      className={clsx(
        styles.container,
        isMobile ? styles["mobile-height"] : styles["desktop-height"]
      )}
    />
  );
}
