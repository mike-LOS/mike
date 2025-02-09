import { usePrivy } from '@privy-io/react-auth';
import { Button } from './button';
import { Wallet } from 'lucide-react';
import { memo } from 'react';

export const ConnectWallet = memo(function ConnectWallet() {
    const { login, ready, authenticated, user, logout } = usePrivy();
    
    // Only log state changes when they actually change
    const walletState = {
        ready,
        authenticated,
        userId: user?.id,
        walletAddress: user?.wallet?.address,
        walletType: user?.wallet?.walletClientType
    };
    
    const handleClick = () => {
        if (!ready) return;
        
        console.log('Wallet action triggered:', {
            action: authenticated ? 'logout' : 'login',
            currentState: walletState,
            timestamp: new Date().toISOString()
        });
        
        if (authenticated) {
            logout();
        } else {
            login();
        }
    };
    
    return (
        <Button 
            variant="default"
            size="lg"
            className="gap-2 text-lg px-8 py-6"
            disabled={!ready} 
            onClick={handleClick}
        >
            <Wallet className="h-6 w-6" />
            {!ready ? 'Loading...' : authenticated ? 'Disconnect Wallet' : 'Connect Wallet'}
        </Button>
    );
}); 