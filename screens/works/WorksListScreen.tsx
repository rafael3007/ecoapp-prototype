import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MobileLayout } from '../../components/layout/MobileLayout';
import {
    ArrowLeft,
    Search,
    MapPin,
    PlayCircle,
    PauseCircle,
    CheckCircle2,
    Clock,
    ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { WorkStatus } from '../../types';

const statusConfig = {
    in_progress: {
        label: 'Em Execução',
        icon: PlayCircle,
        color: 'bg-secondary/15 text-secondary',
        borderColor: 'border-secondary',
    },
    programmed: {
        label: 'Programada',
        icon: Clock,
        color: 'bg-primary/15 text-primary',
        borderColor: 'border-primary',
    },
    paused: {
        label: 'Pausada',
        icon: PauseCircle,
        color: 'bg-yellow-500/15 text-yellow-600',
        borderColor: 'border-yellow-500',
    },
    completed: {
        label: 'Concluída',
        icon: CheckCircle2,
        color: 'bg-muted-foreground/15 text-muted-foreground',
        borderColor: 'border-muted-foreground/30',
    },
};

const WorksListScreen: React.FC = () => {
    const { navigateTo, works } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<WorkStatus | null>(null);

    const filteredWorks = useMemo(() => works
        .filter(work => {
            const matchesSearch =
                work.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                work.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                work.address.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = !filterStatus || work.status === filterStatus;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            const statusOrder: Record<WorkStatus, number> = { in_progress: 0, programmed: 1, paused: 2, completed: 3 };
            return statusOrder[a.status] - statusOrder[b.status];
        }), [works, searchQuery, filterStatus]);

    const inProgressCount = useMemo(() => works.filter(w => w.status === 'in_progress').length, [works]);
    const programmedCount = useMemo(() => works.filter(w => w.status === 'programmed').length, [works]);

    return (
        <MobileLayout title="Obras">
            <div className="p-4 space-y-4 pb-24">
                <button
                    onClick={() => navigateTo('home')}
                    className="flex items-center gap-2 text-muted-foreground"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Voltar</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card border border-border p-4 rounded-xl shadow-sm text-center">
                        <p className="text-3xl font-bold text-secondary">{inProgressCount}</p>
                        <p className="text-sm text-muted-foreground">Em Execução</p>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl shadow-sm text-center">
                        <p className="text-3xl font-bold text-primary">{programmedCount}</p>
                        <p className="text-sm text-muted-foreground">Programadas</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar obra..."
                        className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-card focus:ring-primary focus:border-primary transition"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    <button
                        onClick={() => setFilterStatus(null)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                            !filterStatus
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-foreground border border-border"
                        )}
                    >
                        Todas
                    </button>
                    {(Object.keys(statusConfig) as WorkStatus[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setFilterStatus(key)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                filterStatus === key
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card text-foreground border border-border"
                            )}
                        >
                            {statusConfig[key].label}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filteredWorks.map((work) => {
                        const status = statusConfig[work.status];
                        const StatusIcon = status.icon;

                        return (
                            <button
                                key={work.id}
                                onClick={() => navigateTo('work_detail', work.id)}
                                className={cn(
                                    "w-full bg-card p-4 rounded-xl shadow-sm text-left active:scale-[0.99] transition-transform border-l-4 border",
                                    status.borderColor,
                                    'border-t-border border-r-border border-b-border'
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary">
                                            {work.code}
                                        </span>
                                        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs", status.color)}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            <span>{status.label}</span>
                                        </span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{work.name}</h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{work.address}, {work.city}</span>
                                </div>
                                {work.status === 'in_progress' && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Progresso</span>
                                            <span className="font-semibold text-foreground">{work.progress}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-secondary rounded-full transition-all"
                                                style={{ width: `${work.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                    {filteredWorks.length === 0 && (
                        <div className="text-center py-12 bg-card rounded-xl border border-border">
                            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">Nenhuma obra encontrada</p>
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
};

export default WorksListScreen;