import clsx from "clsx";
import { useOpcWriter } from "../../shared/hooks/useOpcWriter";
import { COMMAND_LABELS } from "../../utils/labels";
import type { CommandKey, CommandsState } from "../../utils/types";
import styles from "./WaterControls.module.css";

/**
 * Пропсы компонента WaterControls.
 */
type WaterControlsProps = {
  /** Текущее состояние всех управляющих команд */
  commands: Partial<CommandsState>;
  /** Статус подключения к WebSocket (пока не используется в UI) */
  connected: boolean;
};

/**
 * Компонент панели управления системой.
 *
 * Позволяет отправлять команды на сервер OPC через REST API.
 * Каждая кнопка отражает текущее состояние команды (`ON` / `OFF`),
 * и при клике переключает её значение.
 *
 * @example
 * ```tsx
 * <WaterControls commands={commands} connected={connected} />
 * ```
 */
export function WaterControls({
  commands,
  connected: _connected,
}: WaterControlsProps) {
  /**
   * Хук для записи команд на сервер.
   * Использует базовый адрес текущего сайта (location.protocol + location.host).
   */
  // const { write, busy, error } = useOpcWriter("https://192.168.1.2:8000");
  const { write, busy, error } = useOpcWriter(
    `${location.protocol}//${location.host}`
  );

  /**
   * Переключение состояния команды.
   *
   * @param name Имя команды (например, `"enable_P1_cmd"`)
   */
  async function toggle(name: CommandKey) {
    const cur = Boolean(commands[name]);
    await write(name, !cur);
  }

  /** Список всех доступных команд из словаря меток */
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
