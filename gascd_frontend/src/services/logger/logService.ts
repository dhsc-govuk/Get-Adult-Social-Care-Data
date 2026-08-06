// Service to let the browser client log events back to the server via the api.
// The client sends only a fixed code from an allowlist (ClientLogCode); the
// server maps it to a message. Free text is never sent, to prevent log
// injection (CWE-117).
import { withBasePath } from '@/lib/basePath';
import { ClientLogCode } from './clientLogCodes';

class LogService {
  public static async logEvent(code: ClientLogCode): Promise<void> {
    const response = await fetch(withBasePath('/api/logger'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      console.error(
        `Error logging event: ${response.status} ${response.statusText}`
      );
    }
  }
}

export default LogService;
