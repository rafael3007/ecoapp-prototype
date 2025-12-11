import React from 'react';
import { useApp } from '../context/AppContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { ArrowLeft, LogOut, Moon, Sun, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const ProfileScreen: React.FC = () => {
    const { user, logout, theme, setTheme, navigateTo } = useApp();

    return (
        <MobileLayout title="Perfil e Configurações">
            <div className="p-4 space-y-6">
                <button
                    onClick={() => navigateTo('home')}
                    className="flex items-center gap-2 text-muted-foreground"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Voltar</span>
                </button>
                
                {/* User Info */}
                <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <UserCircle className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                        <p className="text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                </div>

                {/* Settings */}
                <div className="bg-card p-4 rounded-xl border border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">Configurações</h3>
                    
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-2">
                        <label className="font-medium text-foreground">Tema do Aplicativo</label>
                        <div className="flex items-center gap-2 bg-muted p-1 rounded-full">
                            <button 
                                onClick={() => setTheme('light')}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    theme === 'light' && "bg-background shadow-sm"
                                )}
                            >
                                <Sun className="w-5 h-5" />
                            </button>
                             <button 
                                onClick={() => setTheme('dark')}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    theme === 'dark' && "bg-background shadow-sm"
                                )}
                            >
                                <Moon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-full p-4 rounded-xl bg-muted text-muted-foreground font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sair da Conta</span>
                </button>
            </div>
        </MobileLayout>
    );
};

export default ProfileScreen;