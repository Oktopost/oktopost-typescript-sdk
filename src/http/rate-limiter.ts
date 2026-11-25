const SAFETY_FACTOR = 0.85;

/** The API's documented limits: 60 calls per second and 120 per 5 seconds, kept under by the safety factor. */
const WINDOWS = [
  { durationMs: 1_000, limit: Math.floor(60 * SAFETY_FACTOR) },
  { durationMs: 5_000, limit: Math.floor(120 * SAFETY_FACTOR) },
];

const LONGEST_WINDOW_MS = Math.max(...WINDOWS.map((window) => window.durationMs));

export class RateLimiter {
  private timestamps: number[] = [];

  async acquire(): Promise<void> {
    while (true) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter((t) => t > now - LONGEST_WINDOW_MS);

      const waitMs = this.waitMs(now);
      if (waitMs <= 0) {
        this.timestamps.push(now);
        return;
      }

      await this.sleep(waitMs);
    }
  }

  private waitMs(now: number): number {
    let waitMs = 0;
    for (const { durationMs, limit } of WINDOWS) {
      const inWindow = this.timestamps.filter((t) => t > now - durationMs);
      if (inWindow.length >= limit) {
        waitMs = Math.max(waitMs, inWindow[inWindow.length - limit] + durationMs - now);
      }
    }
    return waitMs;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
