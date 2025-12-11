import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MobileLayout } from '../../components/layout/MobileLayout';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    MapPin,
    AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, isToday, isSameDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const priorityColors: Record<string, string> = {
    urgent: 'border-l-destructive bg-destructive/5',
    high: 'border-l-yellow-500 bg-yellow-500/5', // Assuming yellow for high priority
    medium: 'border-l-primary bg-primary/5',
    low: 'border-l-muted-foreground bg-muted-foreground/5',
};

const ScheduleScreen: React.FC = () => {
    const { navigateTo, works } = useApp();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const scheduledWorks = works.filter(work =>
        isSameDay(new Date(work.scheduledDate), selectedDate)
    );

    const goToPreviousDay = () => setSelectedDate(prev => addDays(prev, -1));
    const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));
    const goToToday = () => setSelectedDate(new Date());

    return (
        <MobileLayout title="Programação">
            <div className="p-4 space-y-4 pb-24">
                <button
                    onClick={() => navigateTo('home')}
                    className="flex items-center gap-2 text-muted-foreground"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Voltar</span>
                </button>

                <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goToPreviousDay}
                            className="p-3 rounded-xl bg-muted/50 active:scale-95 transition-transform"
                        >
                            <ChevronLeft className="w-5 h-5 text-foreground" />
                        </button>

                        <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">
                                {format(selectedDate, 'dd', { locale: ptBR })}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                                {format(selectedDate, 'EEEE', { locale: ptBR })}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                                {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                            </p>
                        </div>

                        <button
                            onClick={goToNextDay}
                            className="p-3 rounded-xl bg-muted/50 active:scale-95 transition-transform"
                        >
                            <ChevronRight className="w-5 h-5 text-foreground" />
                        </button>
                    </div>

                    {!isToday(selectedDate) ? (
                        <button
                            onClick={goToToday}
                            className="w-full mt-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium"
                        >
                            Voltar para Hoje
                        </button>
                    ) : (
                         <div className="mt-4 py-2 text-center">
                            <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-sm font-medium">
                                Hoje
                            </span>
                        </div>
                    )}
                </div>
                
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                        Próximos 7 dias
                    </h3>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const date = addDays(new Date(), i);
                            const dayWorks = works.filter(w => isSameDay(new Date(w.scheduledDate), date));
                            const isSelected = isSameDay(date, selectedDate);

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "flex flex-col items-center p-2 rounded-xl transition-all",
                                        isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card border border-border"
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs",
                                        isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                                    )}>
                                        {format(date, 'EEE', { locale: ptBR })}
                                    </span>
                                    <span className={cn(
                                        "text-lg font-bold",
                                        isSelected ? "text-primary-foreground" : "text-foreground"
                                    )}>
                                        {format(date, 'd')}
                                    </span>
                                    {dayWorks.length > 0 && (
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full mt-1",
                                            isSelected ? "bg-primary-foreground" : "bg-primary"
                                        )} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                        Obras Programadas ({scheduledWorks.length})
                    </h3>

                    {scheduledWorks.length > 0 ? (
                        <div className="space-y-3">
                            {scheduledWorks.map((work) => (
                                <button
                                    key={work.id}
                                    onClick={() => navigateTo('work_detail', work.id)}
                                    className={cn(
                                        "w-full bg-card border border-border p-4 rounded-xl shadow-sm text-left border-l-4 active:scale-[0.99] transition-transform",
                                        priorityColors[work.priority]
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-xs font-bold text-primary">{work.code}</span>
                                        {work.priority === 'urgent' && (
                                            <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                <span>Urgente</span>
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-foreground mb-2">{work.name}</h4>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{work.address}, {work.city}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-card border border-border rounded-xl">
                            <CalendarIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                Nenhuma obra programada para este dia
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </MobileLayout>
    );
}

export default ScheduleScreen;