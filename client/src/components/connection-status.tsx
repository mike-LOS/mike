import { cn } from "@/lib/utils";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ConnectionStatus() {
    const [queryTime, setQueryTime] = useState<number | null>(null);
    const { isAuthenticated, isReady, walletAddress } = useAuth();

    const query = useQuery({
        queryKey: ["status", walletAddress],
        queryFn: async () => {
            const start = performance.now();
            const data = await apiClient.getAgents();
            const end = performance.now();
            setQueryTime(end - start);
            return data;
        },
        refetchInterval: isAuthenticated && isReady ? 5_000 : false,
        enabled: isAuthenticated && isReady && Boolean(walletAddress),
        staleTime: 1000, // Consider data fresh for 1 second
        retry: 1,
        refetchOnWindowFocus: false // Disable refetch on window focus to reduce unnecessary calls
    });

    const apiConnected = query?.isSuccess && !query?.isError;
    const isLoading = query?.isRefetching || query?.isPending;
    const connected = apiConnected && isAuthenticated;

    console.log('Connection status state:', {
        isAuthenticated,
        isReady,
        walletAddress,
        apiConnected,
        isLoading,
        connected,
        timestamp: new Date().toISOString()
    });

    return (
        <SidebarMenuItem>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SidebarMenuButton>
                        <div className="flex flex-col gap-1 select-none transition-all duration-200">
                            <div className="flex items-center gap-1">
                                <div
                                    className={cn([
                                        "h-2.5 w-2.5 rounded-full",
                                        isLoading
                                            ? "bg-muted-foreground"
                                            : connected
                                              ? "bg-green-600"
                                              : "bg-red-600",
                                    ])}
                                />
                                <span
                                    className={cn([
                                        "text-xs",
                                        isLoading
                                            ? "text-muted-foreground"
                                            : connected
                                              ? "text-green-600"
                                              : "text-red-600",
                                    ])}
                                >
                                    {isLoading
                                        ? "Connecting..."
                                        : !isAuthenticated
                                          ? "Wallet Not Connected"
                                          : connected
                                            ? "Connected"
                                            : "API Disconnected"}
                                </span>
                            </div>
                        </div>
                    </SidebarMenuButton>
                </TooltipTrigger>
                {connected ? (
                    <TooltipContent side="top">
                        <div className="flex items-center gap-1">
                            <Activity className="size-4" />
                            <span>{queryTime?.toFixed(2)} ms</span>
                        </div>
                    </TooltipContent>
                ) : null}
            </Tooltip>
        </SidebarMenuItem>
    );
}
