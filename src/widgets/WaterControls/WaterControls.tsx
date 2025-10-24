import { useOpcWriter } from "../../shared/hooks/useOpcWriter";
import { useWebSocket } from "../../shared/hooks/useWebSocket";
import { COMMAND_LABELS } from "../../utils/labels";
import type { CommandKey } from "../../utils/types";

export function WaterControls({ values, connected }) {
  // const { values, connected } = useWebSocket("wss://192.168.1.2:8000/ws");
  const { write, busy, error } = useOpcWriter("https://192.168.1.2:8000");

  async function toggle(name: CommandKey) {
    const cur = Boolean(values[name]);
    await write(name, !cur);
  }

  const keys = Object.keys(COMMAND_LABELS) as CommandKey[];

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ opacity: connected ? 1 : 0.6 }}>
        Статус: {connected ? "WS подключен" : "нет соединения"}
      </div>

      {keys.map((name) => {
        const val = Boolean(values[name]);
        const label = COMMAND_LABELS[name];

        return (
          <button
            key={name}
            onClick={() => toggle(name)}
            disabled={busy}
            title={name}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: val ? "#b0f0b0" : "#f5b0b0",
              border: "1px solid #ccc",
              cursor: busy ? "not-allowed" : "pointer",
              textAlign: "left",
            }}
          >
            {label}: <strong>{val ? "ON" : "OFF"}</strong>
          </button>
        );
      })}

      {error && <div style={{ color: "red" }}>Ошибка: {error}</div>}
    </div>
  );
}
