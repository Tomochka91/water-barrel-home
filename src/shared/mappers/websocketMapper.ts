export type messageData = {
  WS_LE1_VAL: number;
  WS_PE1_VAL: number;
};

export type WaterData = {
  waterLevel: number;
  waterPressure: number;
};

export function mapMessageToWaterData(data: messageData): WaterData {
  return {
    waterLevel: data.WS_LE1_VAL,
    waterPressure: data.WS_PE1_VAL,
  };
}
