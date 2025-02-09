import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setWalletAddress } from '@/lib/api';

export function useAuth() {
    const { ready, authenticated, user } = usePrivy();
    const queryClient = useQueryClient();
    const walletAddress = user?.wallet?.address;
    const hasInvalidatedRef = useRef(false);

    // Memoize the auth state to prevent unnecessary updates
    const authState = useMemo(() => ({
        isReady: ready,
        isAuthenticated: authenticated && Boolean(walletAddress),
        walletAddress,
        user
    }), [ready, authenticated, walletAddress, user]);

    // Handle wallet address changes
    useEffect(() => {
        if (walletAddress !== undefined) {
            setWalletAddress(walletAddress);
            
            // Only invalidate queries if we're fully authenticated and haven't done so yet
            if (ready && authenticated && !hasInvalidatedRef.current) {
                hasInvalidatedRef.current = true;
                queryClient.invalidateQueries({ queryKey: ['agents'] });
            }
        }

        // Reset the ref when wallet address becomes undefined (user disconnects)
        if (walletAddress === undefined) {
            hasInvalidatedRef.current = false;
        }
    }, [walletAddress, ready, authenticated, queryClient]);

    return authState;
} 