export function authDebug(event: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[auth] ${event}`, details);
  }
}
