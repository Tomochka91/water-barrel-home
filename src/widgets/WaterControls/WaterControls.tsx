// import clsx from "clsx";
import { useOpcWriter } from "../../shared/hooks/useOpcWriter";
import { COMMAND_LABELS } from "../../utils/labels";
import type { CommandKey, CommandsState } from "../../utils/types";
import styles from "./WaterControls.module.css";
import { memo, useCallback, useMemo } from "react";
import { CommandButton } from "../../shared/components/ControlButton/ControlButton";

/**
 * Пропсы компонента WaterControls.
 */
type WaterControlsProps = {
  /** Текущее состояние всех управляющих команд */
  commands: Partial<CommandsState>;
  /** Статус подключения к WebSocket (пока не используется в UI) */
  connected?: boolean;
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
export const WaterControls = memo(function WaterControls({
  commands,
}: WaterControlsProps) {
  /**
   * Хук для записи команд на сервер.
   * Использует базовый адрес текущего сайта (location.protocol + location.host).
   */
  const { write, busy, error } = useOpcWriter(
    `${location.protocol}//${location.host}`
  );
  // const { write, busy, error } = useOpcWriter("http://192.168.1.2:8000");

  /**
   * Переключение состояния команды.
   *
   * @param name Имя команды (например, `"enable_P1_cmd"`)
   */
  const handleToggle = useCallback(
    async (name: CommandKey, current: boolean) => {
      await write(name, !current);
    },
    [write]
  );

  /** Мемо-список кнопок (чистые примитивы) */
  const buttons = useMemo(() => {
    return (Object.entries(COMMAND_LABELS) as [CommandKey, string][]).map(
      ([name, label]) => ({
        name,
        label,
        value: Boolean(commands[name]),
      })
    );
  }, [commands]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        {buttons.map((btn) => (
          <CommandButton
            key={btn.name}
            name={btn.name}
            label={btn.label}
            value={btn.value}
            busy={!!busy}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <div className={styles.error}>
        {error && <span>Ошибка: {error}</span>}
      </div>
    </div>
  );
});
