// types/google.d.ts
interface GoogleOAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    error?: string;
    error_description?: string;
}

interface GoogleTokenClient {
    requestAccessToken: (options?: any) => void;
}

interface GoogleAccounts {
    oauth2: {
        initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleOAuthTokenResponse) => void;
            error_callback?: (error: any) => void;
        }) => GoogleTokenClient;
    };
}

declare global {
    interface Window {
        google: {
            accounts: GoogleAccounts;
        };
    }
}

export { };