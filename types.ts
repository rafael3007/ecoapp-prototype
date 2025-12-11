export interface User {
  id: string;
  name: string;
  cpf: string;
  role: 'encarregado' | 'eletricista' | 'motorista' | 'eletricista-lv';
}

export interface TeamMember {
  id: string;
  name: string;
  cpf: string;
  role: 'encarregado' | 'eletricista' | 'motorista' | 'auxiliar' | 'eletricista-lv';
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

export type WorkStatus = 'in_progress' | 'programmed' | 'paused' | 'completed';
export type WorkPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Work {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  scheduledDate: string;
  status: WorkStatus;
  priority: WorkPriority;
  progress: number;
  points: ProjectPoint[];
  extensions: NetworkExtension[];
}

export type PointStatus = 'budgeted' | 'executed' | 'modified' | 'new';

// New detailed point data structure
export interface PostePonto {
    pg: string;
    alturaEsforco: string;
    estrutura: {
        tipo: 'N1' | 'N3' | 'U3' | 'Outra';
        variacao: 'Bifásica' | 'Trifásica' | 'Transição BI-TRI' | 'N/A';
    };
}

export interface AterramentoPonto {
    existe: boolean;
    tipo: 'interno' | 'externo' | null;
}

export interface ParaRaioPonto {
    existe: boolean;
    fases: 'Bifásico' | 'Trifásico' | null;
}

export interface EquipamentoPonto {
    id: string; // Unique ID for the instance of the equipment
    tipo: 'Chave Faca' | 'Chave Fusível' | 'Transformador';
    placa: string;
    cia: string;
    elo?: string;
    potenciaFases?: string; // e.g., "15kVA Monofásico"
    quantidade: number;
}

export interface PodaPonto {
    realizada: boolean;
    tipo: 'Leve' | 'Média' | 'Pesada' | null;
}

export interface PointData {
    poste: PostePonto | null;
    aterramento: AterramentoPonto | null;
    paraRaio: ParaRaioPonto | null;
    equipamentos: EquipamentoPonto[];
    poda: PodaPonto | null;
}


export interface ProjectPoint {
  id: string;
  number: number;
  coordinates: { lat: number, lng: number };
  status: PointStatus;
  budgetedData: PointData;
  executedData: PointData;
}


export interface NetworkExtension {
  id: string;
  fromPointId: string;
  toPointId: string;
  cableType: string;
  length: number;
  status: 'budgeted' | 'executed';
  tensao: 'alta' | 'baixa';
}

// Checklist Types
export type ChecklistItemType = 'text' | 'radio' | 'photo' | 'textarea';

export type ChecklistAnswer = string | null;

export interface ChecklistItem {
  id: string;
  question: string;
  type: ChecklistItemType;
  options?: string[];
  answer: ChecklistAnswer;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Checklist {
  id: string;
  title: string;
  isCompleted: boolean;
  categories: ChecklistCategory[];
}

export interface AppContextType {
    user: User | null;
    team: TeamMember[];
    availableUsers: TeamMember[];
    vehicle: Vehicle | null;
    availableVehicles: Vehicle[];
    works: Work[];
    isShiftOpen: boolean;
    isOnline: boolean;
    syncStatus: 'synced' | 'pending' | 'syncing';
    login: (cpf: string, pass: string) => void;
    logout: () => void;
    openShift: () => void;
    closeShift: () => void;
    updateTeam: (newTeam: TeamMember[]) => void;
    updateVehicle: (newVehicle: Vehicle) => void;
    updateWorkPoint: (workId: string, pointId: string, updatedPointData: PointData) => void;
    addPointToWork: (workId: string, coords: { lat: number, lng: number }) => void;
    removePointFromWork: (workId: string, pointId: string) => void;
    currentView: string;
    navigateTo: (view: string, id?: string | null) => void;
    currentWorkId: string | null;
    currentMemberId: string | null;
    forceSync: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    
    // Checklist state
    aprChecklist: Checklist | null;
    individualChecklists: Record<string, Checklist>;
    initializeChecklists: () => void;
    updateChecklistAnswer: (checklistId: string, categoryId: string, itemId: string, answer: ChecklistAnswer) => void;
    completeChecklist: (checklistId: string) => void;

    // Map interaction state
    isAddingPoint: boolean;
    setIsAddingPoint: (isAdding: boolean) => void;
}