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

const data2 = [
  { name: "0s", pr: 2.06 },
  { name: "3s", pr: 1.98 },
  { name: "6s", pr: 2.1 },
  { name: "9s", pr: 2.25 },
  { name: "12s", pr: 1.89 },
];

export function PressureChart() {
  return (
    <div style={{ width: 320, height: 320 }}>
      <ResponsiveContainer>
        <LineChart
          data={data2}
          margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--cartesian-grid)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 16, fill: "var(--label-color)" }}
          />
          <YAxis
            domain={[0, 4]}
            tick={{ fontSize: 16, fill: "var(--label-color)" }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="pr"
            stroke="var(--pressure-line)"
            strokeWidth={2}
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
