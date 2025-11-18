
interface LogEntry {
  timestamp: string;
  message: string;
}

const LOG_STORAGE_KEY = 'appLogs';
const MAX_LOG_ENTRIES = 200; // Ограничение для предотвращения переполнения localStorage

/**
 * Получает все записи логов из localStorage.
 * @returns {LogEntry[]} Массив записей логов.
 */
export const getLogs = (): LogEntry[] => {
  try {
    const saved = localStorage.getItem(LOG_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Не удалось получить логи:", e);
    return [];
  }
};

/**
 * Добавляет новую запись в лог.
 * @param {string} message - Сообщение для лога.
 */
export const log = (message: string): void => {
  try {
    const logs = getLogs();
    const newLogEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      message,
    };

    // Добавляем новую запись и ограничиваем длину массива
    const updatedLogs = [newLogEntry, ...logs].slice(0, MAX_LOG_ENTRIES);

    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error("Не удалось записать в лог:", e);
  }
};

/**
 * Очищает все записи логов из localStorage.
 */
export const clearLogs = (): void => {
  try {
    localStorage.removeItem(LOG_STORAGE_KEY);
  } catch (e) {
    console.error("Не удалось очистить логи:", e);
  }
};
