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
  /** Давление воды (бар) после фильтров */
  WS_PE2_VAL: number;
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
 * Преобразует часть «сырого» сообщения от сервера
 * в объект телеметрии, удобный для отображения во фронтенде.
 *
 * @param {Partial<messageData>} [raw] - необязательный фрагмент данных, полученный от сервера (snapshot или update)
 * @returns {Telemetry} Объект телеметрии:
 * - `waterLevel` — уровень воды в бочке, %
 * - `waterPressure` — давление перед фильтрами, бар
 * - `pressureAfterFilter` — давление после фильтров, бар
 *
 * @example
 * ```ts
 * const telemetry = mapTelemetry({
 *   WS_LE1_VAL: 52.1,
 *   WS_PE1_VAL: 2.6,
 *   WS_PE2_VAL: 2.3,
 * });
 *
 * console.log(telemetry.waterPressure); // 2.6
 * ```
 */

export function mapTelemetry(raw?: Partial<messageData>): Telemetry {
  /** Данные телеметрии (уровень воды, давление) */
  const telemetry: Telemetry = {
    waterLevel: raw?.WS_LE1_VAL ?? 0,
    waterPressure: raw?.WS_PE1_VAL ?? 0,
    pressureAfterFilter: raw?.WS_PE2_VAL ?? 0,
  };

  return telemetry;
}

/**
 * Преобразует «сырые» флаги команд из сообщения сервера
 * в структуру состояний команд фронтенда.
 *
 * @param {Partial<messageData>} [raw] - необязательный фрагмент данных с флагами команд
 * @returns {Partial<CommandsState>} Объект состояний управляющих команд,
 * где каждое поле — булево значение (`true`/`false`).
 *
 * @example
 * ```ts
 * const commands = mapCommands({
 *   enable_P1_cmd: true,
 *   enable_P2_cmd: false,
 * });
 *
 * console.log(commands.enable_P1_cmd); // true
 * console.log(commands.enable_P2_cmd); // false
 * ```
 */

export function mapCommands(
  raw?: Partial<messageData>
): Partial<CommandsState> {
  /** Состояние управляющих команд */
  const commands: Partial<CommandsState> = {};

  for (const k of COMMAND_KEYS) {
    commands[k] = Boolean(raw?.[k]);
  }

  return commands;
}
