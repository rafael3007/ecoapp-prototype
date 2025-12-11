import React from 'react';
import { useApp } from '../context/AppContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import {
  PlayCircle,
  StopCircle,
  Calendar,
  Wrench,
  Power,
  PowerOff,
  Users,
  ClipboardCheck,
} from 'lucide-react';

const HomeScreen: React.FC = () => {
    const { user, isShiftOpen, closeShift, navigateTo } = useApp();

    const handleToggleShift = () => {
        if (isShiftOpen) {
            closeShift();
        } else {
            navigateTo('open_shift');
        }
    };
    
    const menuItems = [
        { name: 'Programação', icon: Calendar, action: () => navigateTo('schedule'), disabled: false },
        { name: 'Obras', icon: Wrench, action: () => navigateTo('works_list'), disabled: false },
        { name: 'Equipe', icon: Users, action: () => navigateTo('team_edit'), disabled: isShiftOpen },
        { name: 'Checklists', icon: ClipboardCheck, action: () => navigateTo('open_shift'), disabled: isShiftOpen },
    ];

    return (
        <MobileLayout title="Menu Principal" showTitle={false}>
            <div className="p-4 space-y-6">
                <div className="bg-card border border-border p-6 rounded-2xl shadow-md text-center">
                    <h2 className="text-xl font-bold text-foreground">Bem-vindo, {user?.name.split(' ')[0]}!</h2>
                    <p className="text-muted-foreground text-sm mt-1 capitalize">{user?.role}</p>
                </div>

                <div className={`p-4 rounded-2xl flex items-center justify-between ${isShiftOpen ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                    <div className="flex items-center gap-3">
                        {isShiftOpen ? <Power className="w-6 h-6" /> : <PowerOff className="w-6 h-6" />}
                        <div>
                            <p className="font-bold">{isShiftOpen ? 'Turno Aberto' : 'Turno Fechado'}</p>
                            <p className="text-xs">{isShiftOpen ? 'Pronto para iniciar as atividades.' : 'Abra o turno para começar.'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={handleToggleShift}
                        className={`w-full p-6 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 ${isShiftOpen ? 'bg-destructive hover:bg-destructive/90' : 'bg-secondary hover:bg-secondary/90'}`}
                    >
                        {isShiftOpen ? (
                            <>
                                <StopCircle className="w-7 h-7" />
                                <span>Finalizar Turno</span>
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-7 h-7" />
                                <span>Abrir Turno</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.action}
                            disabled={item.disabled}
                            className="bg-card border border-border p-6 rounded-2xl shadow-md text-center disabled:opacity-50 disabled:bg-muted/50 transition-transform active:scale-95 group"
                        >
                            <item.icon className="w-10 h-10 mx-auto text-primary mb-2 transition-transform group-hover:scale-110" />
                            <span className="font-semibold text-foreground">{item.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </MobileLayout>
    );
};

export default HomeScreen;