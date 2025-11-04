// Service to let the browser client log messages back to the server via the api
class LogService {
  public static async logEvent(message: string): Promise<void> {
    const response = await fetch('/api/logger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error(
        `Error logging event: ${response.status} ${response.statusText}`
      );
    }
  }
}

export default LogService;
