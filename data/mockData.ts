import { User, TeamMember, Vehicle, Work, Checklist, ProjectPoint, PointData } from '../types';
import { addDays } from 'date-fns';

export const mockUser: User = {
    id: 'user1',
    name: 'Rafael Brito',
    cpf: '123.456.789-00',
    role: 'encarregado',
};

export const mockTeam: TeamMember[] = [
    { id: 'user1', name: 'Rafael Brito', cpf: '123.456.789-00', role: 'encarregado' },
    { id: 'user2', name: 'João Vittor', cpf: '111.222.333-44', role: 'eletricista' },
    { id: 'user3', name: 'Luis Gustavo', cpf: '555.666.777-88', role: 'motorista' },
    { id: 'user7', name: 'Marcos Januario', cpf: '777.888.999-00', role: 'eletricista-lv' },
];

export const mockAvailableUsers: TeamMember[] = [
    ...mockTeam,
    { id: 'user4', name: 'Carlos Silva', cpf: '999.888.777-66', role: 'eletricista' },
    { id: 'user5', name: 'Pedro Almeida', cpf: '123.123.123-12', role: 'auxiliar' },
    { id: 'user6', name: 'Mariana Costa', cpf: '456.456.456-45', role: 'eletricista' },
];

export const mockVehicle: Vehicle = {
    id: 'vehicle1',
    plate: 'BRA-2E19',
    model: 'Fiat Strada',
};

export const mockAllVehicles: Vehicle[] = [
    { id: 'vehicle1', plate: 'BRA-2E19', model: 'Fiat Strada' },
    { id: 'vehicle2', plate: 'XYZ-1234', model: 'VW Saveiro' },
    { id: 'vehicle3', plate: 'ABC-5678', model: 'Ford Ranger' },
    { id: 'vehicle4', plate: 'DEF-9012', model: 'Chevrolet S10' },
];

const emptyPointData: PointData = { poste: null, aterramento: null, paraRaio: null, equipamentos: [], poda: null };

const budgetedPoint1Data: PointData = {
    poste: { pg: 'A-123', alturaEsforco: '12/300', estrutura: { tipo: 'N1', variacao: 'Bifásica' } },
    aterramento: { existe: true, tipo: 'interno' },
    paraRaio: null,
    equipamentos: [
        { id: 'eq1', tipo: 'Chave Fusível', placa: 'CF-001', cia: 'CIA-001', elo: '10K', quantidade: 2 },
    ],
    poda: null,
};

const executedPoint1Data: PointData = { ...budgetedPoint1Data }; // Same as budgeted for demo

const budgetedPoint2Data: PointData = {
    poste: { pg: 'A-124', alturaEsforco: '12/300', estrutura: { tipo: 'N3', variacao: 'Trifásica' } },
    aterramento: null,
    paraRaio: { existe: true, fases: 'Trifásico' },
    equipamentos: [
        { id: 'eq2', tipo: 'Transformador', placa: 'TR-001', cia: 'CIA-002', elo: '15K', potenciaFases: '30kVA Trifásico', quantidade: 1 },
    ],
    poda: null,
};


export const mockWorks: Work[] = [
    {
        id: 'work1',
        code: 'OS-2024-001',
        name: 'Expansão de Rede - Centro de Ouricuri',
        address: 'Av. Antônio Pedro da Silva',
        city: 'Ouricuri, PE',
        scheduledDate: new Date().toISOString(),
        status: 'in_progress',
        priority: 'high',
        progress: 25,
        points: [
            { id: 'pt1', number: 1, coordinates: { lat: -7.8819, lng: -40.0835 }, status: 'executed', budgetedData: budgetedPoint1Data, executedData: { ...executedPoint1Data, poda: { realizada: true, tipo: 'Média' } } },
            { id: 'pt2', number: 2, coordinates: { lat: -7.8825, lng: -40.0845 }, status: 'budgeted', budgetedData: budgetedPoint2Data, executedData: emptyPointData },
            { id: 'pt3', number: 3, coordinates: { lat: -7.8830, lng: -40.0830 }, status: 'budgeted', budgetedData: budgetedPoint1Data, executedData: emptyPointData },
            { id: 'pt4', number: 4, coordinates: { lat: -7.8840, lng: -40.0850 }, status: 'new', budgetedData: emptyPointData, executedData: emptyPointData },
        ],
        extensions: [
            { id: 'ext1', fromPointId: 'pt1', toPointId: 'pt2', cableType: 'Cabo 35mm', length: 50, status: 'executed', tensao: 'alta' },
            { id: 'ext2', fromPointId: 'pt2', toPointId: 'pt3', cableType: 'Cabo 35mm', length: 55, status: 'budgeted', tensao: 'alta' },
            { id: 'ext3', fromPointId: 'pt3', toPointId: 'pt4', cableType: 'Cabo multiplex', length: 70, status: 'budgeted', tensao: 'baixa' },
        ],
    },
    { id: 'work2', code: 'OS-2024-002', name: 'Manutenção Preventiva - Centro', address: 'Rua do Príncipe, 456', city: 'Joinville', scheduledDate: new Date().toISOString(), status: 'programmed', priority: 'urgent', progress: 0, points: [], extensions: [] },
    { id: 'work3', code: 'OS-2024-003', name: 'Ligação Nova - Residencial Flores', address: 'Rua das Flores, 789', city: 'São Francisco do Sul', scheduledDate: addDays(new Date(), 1).toISOString(), status: 'programmed', priority: 'medium', progress: 0, points: [], extensions: [] },
];


// --- CHECKLIST DATA ---
const createItems = (items: { id: string, q: string, t: any, o?: string[] }[]) =>
    items.map(item => ({ id: item.id, question: item.q, type: item.t, options: item.o, answer: null }));

export const checklistData: { apr: Checklist, individual: Record<string, Checklist> } = {
    apr: {
        id: 'apr',
        title: 'APR / Checklist de Viatura',
        isCompleted: false,
        categories: [
            {
                id: 'c1', title: 'Informações Gerais', items: createItems([
                    { id: 'i1', q: 'QUAL A BASE DE SAIDA?', t: 'text' },
                    { id: 'i2', q: 'Latitude', t: 'text' },
                    { id: 'i3', q: 'Longitude', t: 'text' },
                ])
            },
            {
                id: 'c2', title: 'Camera Da Equipe', items: createItems([
                    { id: 'i4', q: 'Informe o código da câmera da equipe:', t: 'text' },
                    { id: 'i5', q: 'Status da câmera:', t: 'radio', o: ['NÃO SE APLICA', 'OK'] },
                    { id: 'i6', q: 'Data e hora da câmera estão corretas?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i7', q: 'Observações:', t: 'textarea' },
                ])
            },
            {
                id: 'c3', title: 'Chek-list de Comportamento no Trânsito', items: createItems([
                    { id: 'i8', q: 'O condutor do veículo esta em boas condições físicas e sente-se bem para dirigir o veículo?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i9', q: 'Antes dos deslocamentos será realizado um planejamento do roteiro mais seguro?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i10', q: 'Manterá a atenção voltada para o trajeto?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i11', q: 'Somente ultrapassará quando necessário, dentro da lei e de forma segura?', t: 'radio', o: ['SIM', 'NÃO'] },
                ])
            },
            {
                id: 'c4', title: 'Chek-list do veículo', items: createItems([
                    { id: 'i12', q: 'A documentação obrigatória do veículo e a CNH condutor estão validas e vigentes?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i13', q: 'O nível de óleo e água está dentro dos limites máximo e mínimo necessários?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i14', q: 'Existe algum vazamento de água ou óleo?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i15', q: 'Os pneus e o estepe estão em condições de segurança (calibrados)?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i16', q: 'O desgaste do pneu está dentro do permitido (TWI)?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i17', q: 'As sinalizações e a parte elétrica disponíveis no veículo estão funcionando?', t: 'radio', o: ['SIM', 'NÃO'] },
                    { id: 'i18', q: 'Foto da Viatura:', t: 'photo' },
                ])
            }
        ],
    },
    individual: {
        eletricista: {
            id: 'eletricista', title: 'Checklist Eletricista', isCompleted: false, categories: [
                { id: 'c1', title: 'ITENS USO INDIVIDUAIS', items: createItems([
                    { id: 'i1', q: 'Foto do Colaborador', t: 'photo' },
                    { id: 'i2', q: 'CAPACETE ABA FRONTAL BRANCO - CLASSE B', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i3', q: 'BONE SEM ABA COM SAIA – TIPO TOUCA ARABE', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i4', q: 'CAPUZ BALACLAVA RESISTENTE AO ARCO ELETRICO', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i5', q: 'LUVA SEGURANÇA CLASSE 0 TIPO II', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i6', q: 'LUVA SEGURANÇA CLASSE 2 TIPO II', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                ])}
            ]
        },
        motorista: {
            id: 'motorista', title: 'Checklist Motorista', isCompleted: false, categories: [
                { id: 'c1', title: 'ITENS USO INDIVIDUAIS', items: createItems([
                    { id: 'i1', q: 'Foto do Colaborador', t: 'photo' },
                    { id: 'i2', q: 'CAPACETE ABA FRONTAL BRANCO - CLASSE B', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i3', q: 'ÓCULOS SEGURANÇA – LENTES CINZA', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i4', q: 'LUVA PROTEÇÃO VAQUETA', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i5', q: 'BOTINA SEGUR VAQUETA PRETA', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                ])}
            ]
        },
        encarregado: {
            id: 'encarregado', title: 'Checklist Encarregado', isCompleted: false, categories: [
                { id: 'c1', title: 'ITENS USO INDIVIDUAIS', items: createItems([
                    { id: 'i1', q: 'Foto do Colaborador', t: 'photo' },
                    { id: 'i2', q: 'CAPACETE ABA FRONTAL BRANCO - CLASSE B', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i3', q: 'CAMISA RESISTENTE ARCO ELETRICO', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i4', q: 'CINTURÃO SEGURANÇA PARAQUEDISTA ANTICHAMA', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                ])},
                { id: 'c2', title: 'ITENS USO COLETIVO', items: createItems([
                    { id: 'i5', q: 'CONJ ATERRAMENTO TEMP SEC MULTIPLEX NE', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i6', q: 'DETECTOR TENSAO POR CONTATO 3,8 A 36KV', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i7', q: 'ESCADA DE FIBRA EXTENSÍVEL (6,6m - 22 DEGRAUS)', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                ])}
            ]
        },
        'eletricista-lv': {
            id: 'eletricista-lv', title: 'Checklist Eletricista LV', isCompleted: false, categories: [
                { id: 'c1', title: 'ITENS USO INDIVIDUAIS', items: createItems([
                    { id: 'i1', q: 'Foto do Colaborador', t: 'photo' },
                    { id: 'i2', q: 'CAPACETE ABA FRONTAL BRANCO - CLASSE B', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i3', q: 'MACACAO RESISTENTE ARCO ELETRICO', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i4', q: 'CINTURÃO SEGURANÇA PARAQUEDISTA ANTICHAMA PARA LINHA VIVA', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                    { id: 'i5', q: 'MANGA PROTEÇÃO SEGURANÇA CLASSE 2', t: 'radio', o: ['CONFORME', 'NÃO SE APLICA'] },
                ])}
            ]
        },
    }
};