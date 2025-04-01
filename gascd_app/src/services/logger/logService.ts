class LogService {

    public static async logEvent(message: string): Promise<void>{

        const isLocal = process.env.NEXT_PUBLIC_APP_ENV === 'local';
        if(isLocal){
            return;
        }
        const response = await fetch('/api/logger', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({message}),
        });
    
        if (!response.ok) {
            console.error(`Error logging event: ${response.status} ${response.statusText}`);
        }
  }
}

export default LogService;