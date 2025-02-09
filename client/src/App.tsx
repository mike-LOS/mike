import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router";
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import Chat from "./routes/chat";
import Overview from "./routes/overview";
import Home from "./routes/home";
import useVersion from "./hooks/use-version";
import { useEffect } from "react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Number.POSITIVE_INFINITY,
        },
    },
});

// Debug wrapper component
function DebugWrapper({ children }: { children: React.ReactNode }) {
    const { ready, authenticated, user } = usePrivy();
    
    useEffect(() => {
        console.log('Privy state changed:', { 
            ready, 
            authenticated,
            walletAddress: user?.wallet?.address,
            timestamp: new Date().toISOString()
        });
    }, [ready, authenticated, user?.wallet?.address]);
    
    return <>{children}</>;
}

function App() {
    useVersion();
    // Using import.meta.env for Vite environment variables
    const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
    console.log('Environment variables:', JSON.stringify({
        privyAppId,
        allEnv: {
            ...import.meta.env,
            // Filter out any sensitive data
            VITE_PRIVY_SECRET: '[FILTERED]'
        }
    }, null, 2));
    
    if (!privyAppId) {
        console.error('Privy App ID is missing!');
        return <div>Error: Privy App ID is not configured</div>;
    }
    
    return (
        <PrivyProvider
            appId={privyAppId}
            config={{
                appearance: {
                    theme: 'dark',
                    accentColor: '#676FFF',
                },
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
                loginMethods: ['email', 'wallet'],
            }}
        >
            <DebugWrapper>
                <QueryClientProvider client={queryClient}>
                    <div
                        className="dark antialiased"
                        style={{
                            colorScheme: "dark",
                        }}
                    >
                        <BrowserRouter>
                            <TooltipProvider delayDuration={0}>
                                <SidebarProvider>
                                    <AppSidebar />
                                    <SidebarInset>
                                        <div className="flex flex-1 flex-col gap-4 size-full container">
                                            <Routes>
                                                <Route path="/" element={<Home />} />
                                                <Route
                                                    path="chat/:agentId"
                                                    element={<Chat />}
                                                />
                                                <Route
                                                    path="settings/:agentId"
                                                    element={<Overview />}
                                                />
                                            </Routes>
                                        </div>
                                    </SidebarInset>
                                </SidebarProvider>
                                <Toaster />
                            </TooltipProvider>
                        </BrowserRouter>
                    </div>
                </QueryClientProvider>
            </DebugWrapper>
        </PrivyProvider>
    );
}

export default App;
