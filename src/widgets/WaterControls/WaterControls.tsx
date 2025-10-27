import clsx from "clsx";
import { useOpcWriter } from "../../shared/hooks/useOpcWriter";
import { COMMAND_LABELS } from "../../utils/labels";
import type { CommandKey, CommandsState } from "../../utils/types";
import styles from "./WaterControls.module.css";

type WaterControlsProps = {
  commands: Partial<CommandsState>;
  connected: boolean;
};

export function WaterControls({
  commands,
  connected: _connected,
}: WaterControlsProps) {
  const { write, busy, error } = useOpcWriter("https://192.168.1.2:8000");

  async function toggle(name: CommandKey) {
    const cur = Boolean(commands[name]);
    await write(name, !cur);
  }

  const keys = Object.keys(COMMAND_LABELS) as CommandKey[];

  return (
    <div className={styles.container}>
      {/* <div style={{ opacity: connected ? 1 : 0.6 }}>
        Статус: {connected ? "WS подключен" : "нет соединения"}
      </div> */}

      {keys.map((name) => {
        const val = Boolean(commands[name]);
        const label = COMMAND_LABELS[name];

        return (
          <button
            key={name}
            onClick={() => toggle(name)}
            disabled={busy}
            title={name}
            className={clsx(
              styles.btn,
              busy ? styles["btn-busy"] : "",
              val ? styles["btn-on"] : styles["btn-off"]
            )}
          >
            {label}: <strong>{val ? "ON" : "OFF"}</strong>
          </button>
        );
      })}

      {error && <div style={{ color: "red" }}>Ошибка: {error}</div>}
    </div>
  );
}
