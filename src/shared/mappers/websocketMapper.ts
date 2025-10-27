import type { CommandKey, CommandsState, Telemetry } from "../../utils/types";

export type messageData = {
  WS_LE1_VAL: number;
  WS_PE1_VAL: number;
  alm_reset_cmd: boolean;
  auto_alm_reset_cmd: boolean;
  enable_P1_cmd: boolean;
  enable_P2_cmd: boolean;
  enable_shedule: boolean;
};

export const COMMAND_KEYS: CommandKey[] = [
  "alm_reset_cmd",
  "auto_alm_reset_cmd",
  "enable_P1_cmd",
  "enable_P2_cmd",
  "enable_shedule",
];

// export type WaterData = {
//   waterLevel: number;
//   waterPressure: number;
//   alarmReset: boolean;
//   autoAlarmReset: boolean;
//   enableP1: boolean;
//   enableP2: boolean;
//   enableShedule: boolean;
// };

export function mapMessageToDomain(raw?: Partial<messageData>): {
  telemetry: Telemetry;
  commands: Partial<CommandsState>;
} {
  const telemetry: Telemetry = {
    waterLevel: raw?.WS_LE1_VAL ?? 0,
    waterPressure: raw?.WS_PE1_VAL ?? 0,
  };

  const commands: Partial<CommandsState> = {};

  for (const k of COMMAND_KEYS) {
    commands[k] = Boolean(raw?.[k]);
  }

  return { telemetry, commands };
}
