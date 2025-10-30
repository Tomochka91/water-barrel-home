import type { CommandKey, CommandsState, Telemetry } from "../../utils/types";

/**
 * Тип полного сообщения, приходящего от сервера.
 * Содержит телеметрию (значения датчиков) и флаги команд.
 */
export type messageData = {
  /** Уровень воды в бочке (%) */
  WS_LE1_VAL: number;
  /** Давление воды (бар) */
  WS_PE1_VAL: number;
  /** Команда: ручной сброс аварии */
  alm_reset_cmd: boolean;
  /** Команда: авто-сброс аварий */
  auto_alm_reset_cmd: boolean;
  /** Команда: включение насоса 1 */
  enable_P1_cmd: boolean;
  /** Команда: включение насоса 2 */
  enable_P2_cmd: boolean;
  /** Команда: включение расписания */
  enable_shedule: boolean;
};

/**
 * Список ключей управляющих команд.
 * Используется для автоматического формирования объекта `commands`.
 */
export const COMMAND_KEYS: CommandKey[] = [
  "alm_reset_cmd",
  "auto_alm_reset_cmd",
  "enable_P1_cmd",
  "enable_P2_cmd",
  "enable_shedule",
];

/**
 * Преобразует «сырое» сообщение от сервера в структуру, удобную для фронтенда.
 *
 * @param raw - частичное сообщение от сервера (snapshot или update)
 * @returns Объект с двумя полями:
 * - `telemetry`: значения датчиков (уровень воды, давление);
 * - `commands`: состояния управляющих команд (true/false).
 *
 * @example
 * ```ts
 * const { telemetry, commands } = mapMessageToDomain({
 *   WS_LE1_VAL: 52.1,
 *   WS_PE1_VAL: 2.6,
 *   enable_P1_cmd: true,
 * });
 *
 * console.log(telemetry.waterLevel); // 52.1
 * console.log(commands.enable_P1_cmd); // true
 * ```
 */
export function mapMessageToDomain(raw?: Partial<messageData>): {
  telemetry: Telemetry;
  commands: Partial<CommandsState>;
} {
  /** Данные телеметрии (уровень воды, давление) */
  const telemetry: Telemetry = {
    waterLevel: raw?.WS_LE1_VAL ?? 0,
    waterPressure: raw?.WS_PE1_VAL ?? 0,
  };

  /** Состояние управляющих команд */
  const commands: Partial<CommandsState> = {};

  for (const k of COMMAND_KEYS) {
    commands[k] = Boolean(raw?.[k]);
  }

  return { telemetry, commands };
}
