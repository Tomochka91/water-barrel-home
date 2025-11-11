import { memo } from "react";
import type { CommandKey } from "../../../utils/types";
import styles from "./ControlButton.module.css";
import clsx from "clsx";

type CommandButtonProps = {
  /** Имя команды (ключ из CommandKey) */
  name: CommandKey;
  /** Отображаемая подпись кнопки */
  label: string;
  /** Текущее состояние команды (вкл/выкл) */
  value: boolean;
  /** Флаг занятости — при true кнопка временно недоступна */
  busy: boolean;
  /**
   * Обработчик переключения состояния команды.
   * Получает имя команды и её текущее состояние.
   */
  onToggle: (name: CommandKey, current: boolean) => void | Promise<void>;
};

/**
 * Универсальная мемо-кнопка для панели управления.
 *
 * Компонент «чистый»: не содержит собственной логики и зависит
 * только от переданных пропсов. Перерисовывается **только**
 * если изменились `value`, `busy` или `label`.
 *
 * @param {CommandButtonProps} props — параметры кнопки
 * @returns {JSX.Element} JSX-элемент кнопки
 *
 * @example
 * ```tsx
 * <CommandButton
 *   name="enable_P1_cmd"
 *   label="Насос P1"
 *   value={true}
 *   busy={false}
 *   onToggle={(name, cur) => write(name, !cur)}
 * />
 * ```
 */
export const CommandButton = memo(
  function CommandButton({
    name,
    label,
    value,
    busy,
    onToggle,
  }: CommandButtonProps) {
    return (
      <button
        key={name}
        onClick={() => onToggle(name, value)}
        disabled={busy}
        title={name}
        className={clsx(
          styles.btn,
          busy ? styles["btn-busy"] : "",
          value ? styles["btn-on"] : styles["btn-off"]
        )}
      >
        {label}: <strong>{value ? "ON" : "OFF"}</strong>
      </button>
    );
  },
  (prevProp, nextProp) =>
    prevProp.value === nextProp.value &&
    prevProp.busy === nextProp.busy &&
    prevProp.label === nextProp.label
);
