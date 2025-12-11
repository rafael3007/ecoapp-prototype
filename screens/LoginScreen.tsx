import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, KeyRound, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

const formatCPF = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    // Limit to 11 digits
    const limitedValue = numericValue.slice(0, 11);
    
    // Apply CPF mask
    let formattedValue = limitedValue;
    if (limitedValue.length > 3) {
        formattedValue = `${limitedValue.slice(0, 3)}.${limitedValue.slice(3)}`;
    }
    if (limitedValue.length > 6) {
        formattedValue = `${formattedValue.slice(0, 7)}.${formattedValue.slice(7)}`;
    }
    if (limitedValue.length > 9) {
        formattedValue = `${formattedValue.slice(0, 11)}-${formattedValue.slice(11)}`;
    }
    return formattedValue;
};


const LoginScreen: React.FC = () => {
    const { login } = useApp();
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            login(cpf, password);
            setIsLoading(false);
        }, 1000);
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCPF(e.target.value));
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <img src="/logo.png" alt="Ecoelétrica Engenharia Logo" className="h-20 w-auto mx-auto" />
                    <h1 className="text-3xl font-bold text-foreground mt-4">Ecoapp</h1>
                    <p className="text-muted-foreground">Acesso da equipe de campo</p>
                </div>

                <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-2">CPF</label>
                            <div className="relative">
                                <User className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="tel"
                                    value={cpf}
                                    onChange={handleCpfChange}
                                    placeholder="000.000.000-00"
                                    className="w-full pl-10 pr-3 py-2 bg-card border border-border rounded-lg focus:ring-ring focus:ring-2 focus:border-primary transition"
                                    required
                                    maxLength={14}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-2">Senha</label>
                            <div className="relative">
                                <KeyRound className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    className="w-full pl-10 pr-10 py-2 bg-card border border-border rounded-lg focus:ring-ring focus:ring-2 focus:border-primary transition"
                                    required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-50 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;