import { useQuery } from "@tanstack/react-query";
import { Cog } from "lucide-react";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { NavLink } from "react-router";
import type { UUID } from "@elizaos/core";
import { formatAgentName } from "@/lib/utils";
import { ConnectWallet } from "@/components/ui/connect-wallet";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
    const { isAuthenticated, isReady, walletAddress } = useAuth();

    const query = useQuery({
        queryKey: ["agents", walletAddress],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: isAuthenticated && isReady ? 5_000 : false,
        enabled: isAuthenticated && isReady && Boolean(walletAddress),
        staleTime: 1000, // Consider data fresh for 1 second
    });

    const agents = query?.data?.agents;
    const isLoading = query.isLoading || !isReady;

    return (
        <div className="flex flex-col gap-4 h-full p-4">
            <div className="flex justify-between items-center">
                <PageTitle title="Agents" />
                <ConnectWallet />
            </div>
            {!isAuthenticated ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl text-muted-foreground mb-4">Please connect your wallet to view available agents</h2>
                        <ConnectWallet />
                    </div>
                </div>
            ) : isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl text-muted-foreground">Loading agents...</h2>
                    </div>
                </div>
            ) : !agents?.length ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl text-muted-foreground">No agents available</h2>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {agents?.map((agent: { id: UUID; name: string }) => (
                        <Card key={agent.id}>
                            <CardHeader>
                                <CardTitle>{agent?.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md bg-muted aspect-square w-full grid place-items-center">
                                    <div className="text-6xl font-bold uppercase">
                                        {formatAgentName(agent?.name)}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="flex items-center gap-4 w-full">
                                    <NavLink
                                        to={`/chat/${agent.id}`}
                                        className="w-full grow"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full grow"
                                        >
                                            Chat
                                        </Button>
                                    </NavLink>
                                    <NavLink
                                        to={`/settings/${agent.id}`}
                                        key={agent.id}
                                    >
                                        <Button size="icon" variant="outline">
                                            <Cog />
                                        </Button>
                                    </NavLink>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
