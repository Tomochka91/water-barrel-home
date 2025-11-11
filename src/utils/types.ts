export type CommandKey =
  | "alm_reset_cmd"
  | "auto_alm_reset_cmd"
  | "enable_P1_cmd"
  | "enable_P2_cmd"
  | "enable_shedule";

export type StatusKey =
  | "WS_LE1_STS"
  | "WS_PS1_STS"
  | "WS_OL_ALARM"
  | "WS_DRY_ALARM"
  | "WS_GENERAL_ALARM"
  | "WS_LS1_STS"
  | "WS_LS2_STS"
  | "WS_LS3_STS"
  | "WS_P1_CMD"
  | "WS_P2_CMD"
  | "WS_Y1_CMD"
  | "WS_Y2_CMD"
  | "WS_Y5_CMD";

export type CommandsState = Record<CommandKey, boolean>;
export type StatusesState = Record<StatusKey, boolean>;

export interface WaterSystemState {
  commands: Partial<CommandsState>;
  statuses: Partial<StatusesState>;
}

export type Telemetry = {
  waterLevel: number;
  waterPressure: number;
  pressureAfterFilter: number;
};
