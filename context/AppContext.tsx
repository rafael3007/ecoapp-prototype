import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, TeamMember, Vehicle, Work, ProjectPoint, Checklist, AppContextType, PointData } from '../types';
import { mockUser, mockTeam, mockVehicle, mockWorks, mockAvailableUsers, mockAllVehicles, checklistData } from '../data/mockData';
import { produce } from 'immer';


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [availableUsers, setAvailableUsers] = useState<TeamMember[]>([]);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
    const [works, setWorks] = useState<Work[]>([]);
    const [isShiftOpen, setIsShiftOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
    const [currentView, setCurrentView] = useState<string>('home');
    const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
    const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
    const [theme, setThemeState] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    
    // Checklist State
    const [aprChecklist, setAprChecklist] = useState<Checklist | null>(null);
    const [individualChecklists, setIndividualChecklists] = useState<Record<string, Checklist>>({});
    
    // Map State
    const [isAddingPoint, setIsAddingPoint] = useState(false);

    const setTheme = (newTheme: 'light' | 'dark') => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const forceSync = useCallback(() => {
        if (!isOnline) return;
        setSyncStatus('syncing');
        setTimeout(() => setSyncStatus('synced'), 2000);
    }, [isOnline]);


    const login = (cpf: string, pass: string) => {
        setUser(mockUser);
        setTeam(mockTeam);
        setAvailableUsers(mockAvailableUsers);
        setVehicle(mockVehicle);
        setAvailableVehicles(mockAllVehicles);
        setWorks(mockWorks);
        navigateTo('home');
    };

    const logout = () => {
        setUser(null);
        setIsShiftOpen(false);
        setAprChecklist(null);
        setIndividualChecklists({});
        navigateTo('home');
    };
    
    const initializeChecklists = useCallback(() => {
        setAprChecklist(JSON.parse(JSON.stringify(checklistData.apr)));
        const newIndividualChecklists: Record<string, Checklist> = {};
        team.forEach(member => {
            const checklistTemplate = checklistData.individual[member.role] || checklistData.individual.eletricista; // Fallback
            newIndividualChecklists[member.id] = {
                ...JSON.parse(JSON.stringify(checklistTemplate)),
                id: member.id,
                title: `${checklistTemplate.title} - ${member.name.split(' ')[0]}`,
            };
        });
        setIndividualChecklists(newIndividualChecklists);
    }, [team]);


    const openShift = () => {
        setIsShiftOpen(true);
        console.log("Shift opened with team:", team, "and vehicle:", vehicle);
        navigateTo('home');
    };

    const closeShift = () => {
        setIsShiftOpen(false);
    };
    
    const updateTeam = (newTeam: TeamMember[]) => {
        setTeam(newTeam);
    };

    const updateVehicle = (newVehicle: Vehicle) => {
        setVehicle(newVehicle);
    };

    const navigateTo = (view: string, id: string | null = null) => {
        if(view === 'open_shift' && !isShiftOpen) {
            initializeChecklists();
        }
        if (view === 'individual_checklist' && id) {
            setCurrentMemberId(id);
        } else {
            setCurrentMemberId(null);
        }
        if (view === 'work_detail' && id) {
            setCurrentWorkId(id);
        } else {
            setCurrentWorkId(null);
        }
        setCurrentView(view);
    };
    
    const updateWorkPoint = (workId: string, pointId: string, updatedPointData: PointData) => {
        setWorks(produce(draft => {
            const work = draft.find(w => w.id === workId);
            if (work) {
                const pointIndex = work.points.findIndex(p => p.id === pointId);
                if (pointIndex !== -1) {
                    work.points[pointIndex].executedData = updatedPointData;
                    // Update status based on execution
                    const hasExecution = updatedPointData.poda?.realizada || (updatedPointData.poste && updatedPointData.poste.pg) || updatedPointData.equipamentos.length > 0;
                    if (work.points[pointIndex].status === 'budgeted' && hasExecution) {
                        work.points[pointIndex].status = 'executed';
                    } else if (hasExecution) {
                        // Logic to determine if it's 'modified' can be more complex
                        // For now, any execution on a non-budgeted point is just 'executed'
                        work.points[pointIndex].status = work.points[pointIndex].status === 'new' ? 'new' : 'executed';
                    }
                }
            }
        }));
    };

    const addPointToWork = (workId: string, coords: {lat: number, lng: number}) => {
       setWorks(produce(draft => {
           const work = draft.find(w => w.id === workId);
           if (work) {
               const nextPointNumber = work.points.length > 0 ? Math.max(...work.points.map(p => p.number)) + 1 : 1;
               const newPoint: ProjectPoint = {
                   id: `pt${Date.now()}`,
                   number: nextPointNumber,
                   coordinates: coords,
                   status: 'new',
                   budgetedData: { poste: null, aterramento: null, paraRaio: null, equipamentos: [], poda: null },
                   executedData: { poste: null, aterramento: null, paraRaio: null, equipamentos: [], poda: null },
               };
               work.points.push(newPoint);
           }
       }));
       setIsAddingPoint(false);
    };

    const removePointFromWork = (workId: string, pointId: string) => {
        setWorks(produce(draft => {
            const work = draft.find(w => w.id === workId);
            if (work) {
                work.points = work.points.filter(p => p.id !== pointId);
            }
        }));
    };
    
    const updateChecklistAnswer = (checklistId: string, categoryId: string, itemId: string, answer: string | null) => {
       if (checklistId === 'apr' && aprChecklist) {
            setAprChecklist(produce(draft => {
                if(!draft) return;
                const category = draft.categories.find(c => c.id === categoryId);
                if (category) {
                    const item = category.items.find(i => i.id === itemId);
                    if (item) item.answer = answer;
                }
            }));
       } else {
            setIndividualChecklists(produce(draft => {
                const checklist = draft[checklistId];
                if (checklist) {
                    const category = checklist.categories.find(c => c.id === categoryId);
                    if (category) {
                        const item = category.items.find(i => i.id === itemId);
                        if (item) item.answer = answer;
                    }
                }
            }));
       }
    };

    const completeChecklist = (checklistId: string) => {
        if (checklistId === 'apr' && aprChecklist) {
            setAprChecklist(produce(draft => {
                if(draft) draft.isCompleted = true;
            }));
        } else {
            setIndividualChecklists(produce(draft => {
                const checklist = draft[checklistId];
                if (checklist) checklist.isCompleted = true;
            }));
        }
    };


    return (
        <AppContext.Provider value={{
            user, team, availableUsers, vehicle, availableVehicles, works, isShiftOpen, isOnline, syncStatus,
            login, logout, openShift, closeShift, updateTeam, updateVehicle, updateWorkPoint, addPointToWork, removePointFromWork,
            currentView, navigateTo, currentWorkId, currentMemberId, forceSync, theme, setTheme,
            aprChecklist, individualChecklists, initializeChecklists, updateChecklistAnswer, completeChecklist,
            isAddingPoint, setIsAddingPoint,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};