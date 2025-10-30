import { useEffect, useRef, useState } from "react";

/**
 * Формат сообщений от WebSocket-сервера.
 *
 * @template T - тип данных, передаваемых сервером.
 *
 * `snapshot` — полное состояние системы (перезаписывает все значения);
 * `update` — частичное обновление (сливается с предыдущим состоянием).
 */
type ServerMessage<T> = {
  snapshot?: T;
  update?: Partial<T>;
};

/**
 * Универсальный React-хук для работы с WebSocket.
 *
 * - Автоматически переподключается при разрыве связи.
 * - Поддерживает частичные обновления состояния (`update`).
 * - Позволяет типизировать структуру данных (`T`).
 *
 * @template T Тип структуры данных, передаваемых сервером.
 * @param url Адрес WebSocket-сервера (например, `"ws://192.168.1.2:8000/ws"`).
 *
 * @returns Объект `{ values, connected }`:
 * - `values`: текущее состояние, собранное из сообщений;
 * - `connected`: `true`, если соединение активно.
 *
 * @example
 * ```ts
 * const { values, connected } = useWebSocket<{ WS_LE1_VAL: number; WS_PE1_VAL: number }>(
 *   "ws://192.168.1.2:8000/ws"
 * );
 * ```
 */
export function useWebSocket<
  T extends Record<string, unknown> = Record<string, number>
>(url: string) {
  /** Последние полученные значения от сервера */
  const [values, setValues] = useState<T>({} as T);

  /** Флаг активного соединения */
  const [connected, setConnected] = useState(false);

  /** Ссылка на текущий WebSocket */
  const socketRef = useRef<WebSocket | null>(null);

  /** Таймер автоматического переподключения */
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    /** Очистка таймера переподключения */
    function cleanupTimer() {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    /** Инициализация и управление подключением */
    function connect() {
      cleanupTimer();
      socketRef.current?.close();

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => setConnected(true);

      socket.onclose = () => {
        setConnected(false);

        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(connect, 2000);
        }
      };

      socket.onerror = () => socket.close();

      socket.onmessage = (e: MessageEvent) => {
        const message = JSON.parse(e.data) as ServerMessage<T>;
        if (message.snapshot) setValues(message.snapshot);

        if (message.update)
          setValues(
            (prev) => ({ ...(prev as object), ...message.update } as T)
          );
      };
    }

    connect();
    return () => {
      cleanupTimer();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [url]);

  return { values, connected };
}
