import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MobileLayout } from '../../components/layout/MobileLayout';
import {
    ArrowLeft, Users, Truck, PlayCircle, Check, AlertTriangle, ChevronRight, Circle, CheckCircle2, FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';

const OpenShiftScreen: React.FC = () => {
    const { navigateTo, team, vehicle, openShift, aprChecklist, individualChecklists } = useApp();

    const allChecklistsCompleted = useMemo(() => {
        if (!aprChecklist || !aprChecklist.isCompleted) return false;
        return Object.values(individualChecklists).every(c => c.isCompleted);
    }, [aprChecklist, individualChecklists]);

    return (
        <MobileLayout title="Checklists Pré-Turno">
            <div className="p-4 space-y-6 pb-24">
                <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-muted-foreground"><ArrowLeft className="w-5 h-5" /><span>Voltar</span></button>
                
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Checklists Pré-Turno</h1>
                    <p className="text-muted-foreground mt-1">Complete todos os itens para iniciar.</p>
                </div>

                <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-3">
                    <h3 className="font-semibold px-1">Checklists Obrigatórios</h3>
                    
                    {/* APR Checklist */}
                    <button 
                        onClick={() => navigateTo('apr_checklist')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><Truck className="w-5 h-5 text-primary" /></div>
                            <div>
                                <p className="font-medium text-foreground">APR / Viatura</p>
                                <p className="text-xs text-muted-foreground">{vehicle?.plate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {aprChecklist?.isCompleted ? 
                                <span className="flex items-center gap-1 text-xs text-secondary"><CheckCircle2 className="w-4 h-4"/><span>Concluído</span></span> :
                                <span className="flex items-center gap-1 text-xs text-yellow-600"><Circle className="w-4 h-4"/><span>Pendente</span></span>
                           }
                           <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </button>
                    
                    {/* Individual Checklists */}
                    {team.map(member => {
                        const checklist = individualChecklists[member.id];
                        return (
                            <button 
                                key={member.id}
                                onClick={() => navigateTo('individual_checklist', member.id)}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
                                    <div>
                                        <p className="font-medium text-foreground">{member.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                    </div>
                                </div>
                                 <div className="flex items-center gap-2">
                                   {checklist?.isCompleted ? 
                                        <span className="flex items-center gap-1 text-xs text-secondary"><CheckCircle2 className="w-4 h-4"/><span>Concluído</span></span> :
                                        <span className="flex items-center gap-1 text-xs text-yellow-600"><Circle className="w-4 h-4"/><span>Pendente</span></span>
                                   }
                                   <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {!allChecklistsCompleted && (
                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-500">
                            Todos os checklists devem ser preenchidos para abrir o turno.
                        </p>
                    </div>
                )}

                <button 
                    onClick={openShift}
                    disabled={!allChecklistsCompleted}
                    className={cn(
                        "w-full py-4 px-4 bg-secondary text-secondary-foreground font-bold rounded-xl flex items-center justify-center gap-3 text-lg transition-transform active:scale-95",
                        !allChecklistsCompleted && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <PlayCircle className="w-6 h-6" />
                    <span>Abrir Turno</span>
                </button>
            </div>
        </MobileLayout>
    );
}

export default OpenShiftScreen;