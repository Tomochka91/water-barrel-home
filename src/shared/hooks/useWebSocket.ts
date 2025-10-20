import { useEffect, useRef, useState } from "react";

type ServerMessage<T> = {
  snapshot?: T;
  update?: Partial<T>;
};

export function useWebSocket<
  T extends Record<string, unknown> = Record<string, number>
>(url: string) {
  const [values, setValues] = useState<T>({} as T);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function cleanupTimer() {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

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
