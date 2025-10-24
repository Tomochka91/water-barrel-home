export type messageData = {
  WS_LE1_VAL: number;
  WS_PE1_VAL: number;
  alm_reset_cmd: boolean;
  auto_alm_reset_cmd: boolean;
  enable_P1_cmd: boolean;
  enable_P2_cmd: boolean;
  enable_shedule: boolean;
};

export type WaterData = {
  waterLevel: number;
  waterPressure: number;
  alarmReset: boolean;
  autoAlarmReset: boolean;
  enableP1: boolean;
  enableP2: boolean;
  enableShedule: boolean;
};

export function mapMessageToWaterData(data: messageData): WaterData {
  return {
    waterLevel: data.WS_LE1_VAL,
    waterPressure: data.WS_PE1_VAL,
    alarmReset: data.alm_reset_cmd,
    autoAlarmReset: data.auto_alm_reset_cmd,
    enableP1: data.enable_P1_cmd,
    enableP2: data.enable_P2_cmd,
    enableShedule: data.enable_shedule,
  };
}
