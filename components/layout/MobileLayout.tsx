import React, { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { Wifi, WifiOff, RefreshCw, UserCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const EcoLogo = ({ className }: { className?: string }) => (
    <img src="/logo.png" alt="Ecoelétrica Logo" className={cn("h-8 w-auto", className)} />
);


interface MobileLayoutProps {
  title: string;
  children: ReactNode;
  showTitle?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ title, children, showTitle = true }) => {
    const { isOnline, syncStatus, forceSync, navigateTo } = useApp();

    const SyncIcon = () => {
        if (syncStatus === 'syncing') {
            return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
        }
        if (syncStatus === 'pending') {
            return <RefreshCw className="w-5 h-5 text-yellow-500" />;
        }
        return <RefreshCw className="w-5 h-5 text-muted-foreground" />;
    };

    return (
        <div className="h-full w-full max-w-lg mx-auto bg-background text-foreground flex flex-col shadow-2xl">
            <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4 sticky top-0 z-40 flex items-center justify-between">
                <div>
                    {showTitle ? (
                        <h1 className="text-lg font-bold text-foreground">{title}</h1>
                    ) : (
                        <EcoLogo />
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={forceSync} disabled={!isOnline || syncStatus === 'syncing'}>
                       <SyncIcon />
                    </button>
                    {isOnline ? (
                        <Wifi className="w-5 h-5 text-secondary" />
                    ) : (
                        <WifiOff className="w-5 h-5 text-destructive" />
                    )}
                    <button onClick={() => navigateTo('profile')}>
                        <UserCircle className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};