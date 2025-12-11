import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { ArrowLeft, UserPlus, UserMinus, Check, Search, X, Lock } from 'lucide-react';
import { TeamMember } from '../../types';
import { cn } from '../../lib/utils';

const roleLabels: Record<string, string> = {
    encarregado: 'Encarregado',
    eletricista: 'Eletricista',
    motorista: 'Motorista',
    auxiliar: 'Auxiliar',
    'eletricista-lv': 'Eletricista Linha Viva',
};

const AddMemberModal: React.FC<{
    onAdd: (member: TeamMember) => void;
    onClose: () => void;
    existingMemberIds: string[];
}> = ({ onAdd, onClose, existingMemberIds }) => {
    const { availableUsers } = useApp();
    const [query, setQuery] = useState('');

    const filteredUsers = availableUsers.filter(user => 
        !existingMemberIds.includes(user.id) &&
        (user.name.toLowerCase().includes(query.toLowerCase()) || 
         user.cpf.includes(query))
    );

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-border">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Adicionar Colaborador</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por nome ou CPF..."
                            className="w-full pl-10 pr-3 py-2 bg-card border border-border rounded-lg focus:ring-ring focus:ring-2 focus:border-primary transition"
                        />
                    </div>
                </div>
                <div className="overflow-auto flex-1 p-4 pt-0 space-y-2">
                    {filteredUsers.map(user => (
                        <button key={user.id} onClick={() => onAdd(user)} className="w-full flex justify-between items-center p-3 bg-muted/40 rounded-lg text-left hover:bg-muted">
                            <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.cpf} &bull; {roleLabels[user.role]}</p>
                            </div>
                            <UserPlus className="w-5 h-5 text-primary" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TeamEditScreen: React.FC = () => {
    const { navigateTo, team, updateTeam, isShiftOpen } = useApp();
    const [currentTeam, setCurrentTeam] = useState<TeamMember[]>(team);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const removeMember = (memberId: string) => {
        const member = currentTeam.find(m => m.id === memberId);
        if (member?.role === 'encarregado') return; // Cannot remove the foreman
        setCurrentTeam(currentTeam.filter(m => m.id !== memberId));
    };

    const addMember = (member: TeamMember) => {
        if (!currentTeam.some(m => m.id === member.id)) {
            setCurrentTeam([...currentTeam, member]);
        }
        setIsAddModalOpen(false);
    };
    
    const handleSaveChanges = () => {
        updateTeam(currentTeam);
        navigateTo('home');
    };

    if (isShiftOpen) {
        return (
            <MobileLayout title="Editar Equipe">
                <div className="p-4">
                    <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-muted-foreground"><ArrowLeft className="w-5 h-5" /><span>Voltar</span></button>
                </div>
                <div className="flex flex-col items-center justify-center text-center h-full -mt-16 p-4">
                    <Lock className="w-16 h-16 text-yellow-500 mb-4" />
                    <h2 className="text-xl font-bold">Equipe Bloqueada</h2>
                    <p className="text-muted-foreground max-w-xs">A equipe não pode ser editada enquanto o turno estiver aberto. Finalize o turno para fazer alterações.</p>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="Editar Equipe">
            <div className="p-4 space-y-6 pb-24">
                 <button
                    onClick={() => navigateTo('home')}
                    className="flex items-center gap-2 text-muted-foreground"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Voltar</span>
                </button>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Membros da Equipe ({currentTeam.length})</h2>
                            <p className="text-sm text-muted-foreground">Gerencie sua equipe para hoje.</p>
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="p-2 bg-primary text-primary-foreground rounded-full">
                            <UserPlus className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
                        {currentTeam.map(member => (
                            <div
                                key={member.id}
                                className="w-full flex items-center justify-between p-3 rounded-lg text-left bg-muted/40"
                            >
                                <div>
                                    <p className="font-medium text-foreground">{member.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{roleLabels[member.role]}</p>
                                </div>
                                {member.role !== 'encarregado' && (
                                     <button onClick={() => removeMember(member.id)} className="p-2 text-muted-foreground hover:text-destructive">
                                        <UserMinus className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/80 backdrop-blur-sm border-t border-border max-w-lg mx-auto">
                 <button
                    onClick={handleSaveChanges}
                    className="w-full py-4 px-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 text-lg"
                 >
                    <Check className="w-6 h-6" />
                    <span>Salvar Alterações</span>
                 </button>
            </div>
            {isAddModalOpen && (
                <AddMemberModal 
                    onAdd={addMember}
                    onClose={() => setIsAddModalOpen(false)}
                    existingMemberIds={currentTeam.map(m => m.id)}
                />
            )}
        </MobileLayout>
    );
};

export default TeamEditScreen;