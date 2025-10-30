import { useState } from "react";

/**
 * Хук для записи управляющих команд на сервер OPC (через REST API).
 *
 * @param apiBase - базовый адрес API (например, "http://192.168.1.2:8000")
 *
 * @returns Объект с методами и состояниями:
 * - `write(name, value)` — асинхронная функция отправки команды;
 * - `busy` — `true`, пока выполняется запрос;
 * - `error` — текст ошибки, если запрос завершился неудачно.
 *
 * Пример использования:
 * ```ts
 * const { write, busy, error } = useOpcWriter("http://192.168.1.2:8000");
 * await write("enable_P1_cmd", true);
 * ```
 */
export function useOpcWriter(apiBase: string) {
  /** Флаг активности запроса */
  const [busy, setBusy] = useState(false);

  /** Сообщение об ошибке (если запрос завершился неудачно) */
  const [error, setError] = useState<string | null>(null);

  /**
   * Отправка команды на сервер.
   *
   * @param name - имя команды (например, "enable_P1_cmd")
   * @param value - значение для записи (boolean, number, string и т.п.)
   */
  async function write(name: string, value: unknown) {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || `HTTP ${res.status}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(e);
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return { write, busy, error };
}
