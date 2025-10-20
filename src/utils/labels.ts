import type { CommandKey, StatusKey } from "./types";

export const COMMAND_LABELS: Record<CommandKey, string> = {
  alm_reset_cmd: "Сброс аварий",
  auto_alm_reset_cmd: "Автосброс аварий",
  enable_P1_cmd: "Насос осмоса P1: разрешить",
  enable_P2_cmd: "Насос осмоса P2: разрешить",
  enable_shedule: "Работа по расписанию",
};

export const STATUS_LABELS: Record<StatusKey, string> = {
  WS_LE1_STS: "Датчик уровня в бочке жив",
  WS_PS1_STS: "Давление перед насосами есть",
  WS_OL_ALARM: "Авария: перелив",
  WS_DRY_ALARM: "Авария: бочка пуста",
  WS_GENERAL_ALARM: "Общая авария",
  WS_LS1_STS: "Датчик перелива",
  WS_LS2_STS: "Датчик полной бочки",
  WS_LS3_STS: "Датчик пустой бочки",
  WS_P1_CMD: "Насос P1 активен",
  WS_P2_CMD: "Насос P2 активен",
  WS_Y1_CMD: "Соленоид P1",
  WS_Y2_CMD: "Соленоид P2",
  WS_Y5_CMD: "Клапан защиты водокачки",
};
