import { memo } from "react";
import type { CommandKey } from "../../../utils/types";
import styles from "./ControlButton.module.css";
import clsx from "clsx";

type CommandButtonProps = {
  name: CommandKey;
  label: string;
  value: boolean;
  busy: boolean;
  onToggle: (name: CommandKey, current: boolean) => void | Promise<void>;
};

/**
 * Универсальная мемо-кнопка.
 * Ререндерится только если value/busy/label реально поменялись.
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
