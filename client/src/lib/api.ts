import type { UUID, Character } from "@elizaos/core";

// Default to 3000 if not specified
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT || 3000;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

console.log('API Configuration:', {
    SERVER_PORT,
    BASE_URL
});

let currentWalletAddress: string | undefined;

export const setWalletAddress = (address: string | undefined) => {
    console.log('Setting wallet address in API client:', {
        previous: currentWalletAddress,
        new: address,
        timestamp: new Date().toISOString()
    });
    currentWalletAddress = address;
};

const fetcher = async ({
    url,
    method,
    body,
    headers,
}: {
    url: string;
    method?: "GET" | "POST";
    body?: object | FormData;
    headers?: HeadersInit;
}) => {
    console.log(`API Request initiated for ${url}:`, {
        method,
        currentWalletAddress,
        hasBody: Boolean(body),
        customHeaders: headers,
        timestamp: new Date().toISOString()
    });

    const options: RequestInit = {
        method: method ?? "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(currentWalletAddress ? { "X-Wallet-Address": currentWalletAddress } : {}),
            ...(headers || {})
        },
    };

    console.log('Request configuration:', {
        url: `${BASE_URL}${url}`,
        method: options.method,
        headers: options.headers,
        hasBody: Boolean(options.body),
        timestamp: new Date().toISOString()
    });

    if (method === "POST") {
        if (body instanceof FormData) {
            if (options.headers && typeof options.headers === 'object') {
                options.headers = Object.fromEntries(
                    Object.entries(options.headers as Record<string, string>)
                        .filter(([key]) => key !== 'Content-Type')
                );
            }
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(`${BASE_URL}${url}`, options);
        console.log(`API Response from ${url}:`, {
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get('Content-Type'),
            timestamp: new Date().toISOString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", {
                status: response.status,
                url,
                errorText,
                timestamp: new Date().toISOString()
            });

            let errorMessage = "An error occurred.";
            try {
                const errorObj = JSON.parse(errorText);
                errorMessage = errorObj.message || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }

            throw new Error(errorMessage);
        }
            
        const data = await response.json();
        console.log(`API Success Response from ${url}:`, {
            data,
            timestamp: new Date().toISOString()
        });
        return data;
    } catch (error) {
        console.error("API Request failed:", {
            url,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
        throw error;
    }
};

export const apiClient = {
    sendMessage: (
        agentId: string,
        message: string,
        selectedFile?: File | null
    ) => {
        const formData = new FormData();
        formData.append("text", message);
        formData.append("user", "user");

        if (selectedFile) {
            formData.append("file", selectedFile);
        }
        return fetcher({
            url: `/${agentId}/message`,
            method: "POST",
            body: formData,
        });
    },
    getAgents: () => fetcher({ url: "/agents" }),
    getAgent: (agentId: string): Promise<{ id: UUID; character: Character }> =>
        fetcher({ url: `/agents/${agentId}` }),
    tts: (agentId: string, text: string) =>
        fetcher({
            url: `/${agentId}/tts`,
            method: "POST",
            body: {
                text,
            },
            headers: {
                "Content-Type": "application/json",
                Accept: "audio/mpeg",
                "Transfer-Encoding": "chunked",
            },
        }),
    whisper: async (agentId: string, audioBlob: Blob) => {
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");
        return fetcher({
            url: `/${agentId}/whisper`,
            method: "POST",
            body: formData,
        });
    },
};
