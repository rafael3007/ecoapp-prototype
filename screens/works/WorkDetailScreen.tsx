import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
    ArrowLeft, Eye, Edit3, Plus, Check, X, Trash2, Save, MousePointerClick, Maximize, ChevronUp, ChevronDown, TowerControl, Zap, TreeDeciduous, ToyBrick, Sprout, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProjectPoint, PointStatus, PointData, EquipamentoPonto } from '../../types';
import { produce } from 'immer';

// --- HELPER COMPONENTS ---

const pointStatusColors: Record<PointStatus, string> = {
    budgeted: 'bg-gray-400',
    executed: 'bg-green-500',
    modified: 'bg-orange-500',
    new: 'bg-blue-500',
};

const createPointIcon = (point: ProjectPoint) => {
    const color = {
        budgeted: '#9ca3af', // gray-400
        executed: '#22c55e', // green-500
        modified: '#f97316', // orange-500
        new: '#3b82f6',      // blue-500
    }[point.status];

    const hasPoda = point.executedData?.poda?.realizada;
    const iconContent = hasPoda
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12v4M12 12h4M12 12H8"/><path d="M8 12v4c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2v-4"/><path d="M12 12V4c0-1.1-.9-2-2-2h-4a2 2 0 0 0-2 2v8"/></svg>`
        : `<span style="font-size: 14px; font-weight: bold; color: white;">${point.number}</span>`;

    return new L.DivIcon({
        html: `<div class="map-point-marker" style="background-color: ${color}; width: 32px; height: 32px;">${iconContent}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

const RecenterButton: React.FC<{bounds: L.LatLngBounds | null}> = ({ bounds }) => {
    const map = useMap();
    const recenter = useCallback(() => {
        if(bounds) map.fitBounds(bounds, { padding: [50, 50] });
    }, [map, bounds]);

    return (
        <button onClick={recenter} className="absolute top-20 right-4 z-[1000] bg-card/90 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-border">
            <Maximize className="w-5 h-5 text-foreground" />
        </button>
    );
};

const MapEvents: React.FC<{ workId: string, onPointSelect: (point: ProjectPoint) => void, points: ProjectPoint[] }> = ({ workId, onPointSelect, points }) => {
    const { isAddingPoint, addPointToWork } = useApp();
    useMapEvents({
        click(e) {
            if (isAddingPoint) {
                addPointToWork(workId, { lat: e.latlng.lat, lng: e.latlng.lng });
            }
        },
    });

    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 0);
    }, [points, map]);

    return null;
}

const ChangeView: React.FC<{ bounds: L.LatLngBounds | null }> = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};

// --- TABS for Point Detail Modal ---

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void, icon: React.ReactNode, disabled?: boolean }> = ({ label, isActive, onClick, icon, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={cn("flex flex-col items-center gap-1 p-2 rounded-lg text-xs", isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted', disabled && 'opacity-40 cursor-not-allowed')}>
        {icon}
        <span>{label}</span>
    </button>
);

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="mt-1">{children}</div>
    </div>
);

const RadioGroup: React.FC<{ options: string[], value: string | null | boolean, onChange: (value: any) => void, isBool?: boolean }> = ({ options, value, onChange, isBool }) => (
    <div className="flex gap-2">{options.map(opt => <button key={opt} onClick={() => onChange(isBool ? opt === 'Sim' : opt)} className={cn("flex-1 py-2 px-3 rounded-lg text-sm border", (isBool ? (value && opt === 'Sim') || (!value && opt === 'Não') : value === opt) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border")}>{opt}</button>)}</div>
);

const PosteTab: React.FC<{ data: PointData, setData: (data: PointData) => void, isReadOnly: boolean }> = ({ data, setData, isReadOnly }) => {
    const update = (field: string, value: any) => {
        setData(produce(data, draft => {
            if (!draft.poste) draft.poste = { pg: '', alturaEsforco: '', estrutura: { tipo: 'N1', variacao: 'N/A' } };
            (draft.poste as any)[field] = value;
        }));
    };
    const updateEstrutura = (field: string, value: any) => {
        setData(produce(data, draft => {
            if (!draft.poste) draft.poste = { pg: '', alturaEsforco: '', estrutura: { tipo: 'N1', variacao: 'N/A' } };
            (draft.poste.estrutura as any)[field] = value;
        }));
    };
    return (
        <div className="space-y-4">
            <FormRow label="PG"><input type="text" value={data.poste?.pg || ''} onChange={e => update('pg', e.target.value)} className="input" readOnly={isReadOnly} /></FormRow>
            <FormRow label="Altura/Esforço"><input type="text" value={data.poste?.alturaEsforco || ''} onChange={e => update('alturaEsforco', e.target.value)} className="input" readOnly={isReadOnly} /></FormRow>
            <FormRow label="Estrutura"><select value={data.poste?.estrutura.tipo || 'N1'} onChange={e => updateEstrutura('tipo', e.target.value)} className="input" disabled={isReadOnly}><option>N1</option><option>N3</option><option>U3</option><option>Outra</option></select></FormRow>
            <FormRow label="Variação da Estrutura"><select value={data.poste?.estrutura.variacao || 'N/A'} onChange={e => updateEstrutura('variacao', e.target.value)} className="input" disabled={isReadOnly}><option>N/A</option><option>Bifásica</option><option>Trifásica</option><option>Transição BI-TRI</option></select></FormRow>
        </div>
    );
};
const AterramentoTab: React.FC<{ data: PointData, setData: (data: PointData) => void, isReadOnly: boolean }> = ({ data, setData, isReadOnly }) => {
    const update = (field: string, value: any) => setData(produce(data, draft => { if (!draft.aterramento) draft.aterramento = { existe: false, tipo: null }; (draft.aterramento as any)[field] = value; }));
    return (
        <div className="space-y-4">
            <FormRow label="Existe Aterramento?"><RadioGroup options={['Sim', 'Não']} value={data.aterramento?.existe || false} onChange={val => isReadOnly ? null : update('existe', val)} isBool /></FormRow>
            {data.aterramento?.existe && <FormRow label="Tipo"><RadioGroup options={['interno', 'externo']} value={data.aterramento.tipo} onChange={val => isReadOnly ? null : update('tipo', val)} /></FormRow>}
        </div>
    );
};
const ParaRaioTab: React.FC<{ data: PointData, setData: (data: PointData) => void, isReadOnly: boolean }> = ({ data, setData, isReadOnly }) => {
    const update = (field: string, value: any) => setData(produce(data, draft => { if (!draft.paraRaio) draft.paraRaio = { existe: false, fases: null }; (draft.paraRaio as any)[field] = value; }));
    return (
        <div className="space-y-4">
            <FormRow label="Existe Para-raio?"><RadioGroup options={['Sim', 'Não']} value={data.paraRaio?.existe || false} onChange={val => isReadOnly ? null : update('existe', val)} isBool /></FormRow>
            {data.paraRaio?.existe && <FormRow label="Fases"><RadioGroup options={['Bifásico', 'Trifásico']} value={data.paraRaio.fases} onChange={val => isReadOnly ? null : update('fases', val)} /></FormRow>}
        </div>
    );
};
const EquipamentoTab: React.FC<{ data: PointData, setData: (data: PointData) => void, isReadOnly: boolean }> = ({ data, setData, isReadOnly }) => {
    const updateEquipamento = (index: number, field: keyof EquipamentoPonto, value: any) => setData(produce(data, draft => { (draft.equipamentos[index] as any)[field] = value; }));
    const addEquipamento = () => setData(produce(data, draft => { draft.equipamentos.push({ id: `eq${Date.now()}`, tipo: 'Chave Faca', placa: '', cia: '', quantidade: 1 }); }));
    const removeEquipamento = (index: number) => setData(produce(data, draft => { draft.equipamentos.splice(index, 1); }));
    return (
        <div className="space-y-4">
            {data.equipamentos.map((eq, index) => (
                <div key={eq.id} className="bg-muted/50 p-3 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <select value={eq.tipo} onChange={e => updateEquipamento(index, 'tipo', e.target.value)} className="input font-semibold" disabled={isReadOnly}><option>Chave Faca</option><option>Chave Fusível</option><option>Transformador</option></select>
                        {!isReadOnly && <button onClick={() => removeEquipamento(index)}><Trash2 className="w-5 h-5 text-destructive" /></button>}
                    </div>
                    <FormRow label="Placa/ID"><input type="text" value={eq.placa} onChange={e => updateEquipamento(index, 'placa', e.target.value)} className="input" readOnly={isReadOnly} /></FormRow>
                    <FormRow label="CIA"><input type="text" value={eq.cia} onChange={e => updateEquipamento(index, 'cia', e.target.value)} className="input" readOnly={isReadOnly} /></FormRow>
                    {(eq.tipo === 'Chave Fusível' || eq.tipo === 'Transformador') && <FormRow label="Elo"><input type="text" value={eq.elo || ''} onChange={e => updateEquipamento(index, 'elo', e.target.value)} className="input" readOnly={isReadOnly} /></FormRow>}
                    {eq.tipo === 'Transformador' && <FormRow label="Potência/Fases"><input type="text" value={eq.potenciaFases || ''} onChange={e => updateEquipamento(index, 'potenciaFases', e.target.value)} className="input" readOnly={isReadOnly} /></FormRow>}
                    <FormRow label="Quantidade"><input type="number" value={eq.quantidade} onChange={e => updateEquipamento(index, 'quantidade', parseInt(e.target.value))} className="input" readOnly={isReadOnly} min="1"/></FormRow>
                </div>
            ))}
            {!isReadOnly && <button onClick={addEquipamento} className="w-full btn btn-muted py-2">Adicionar Equipamento</button>}
        </div>
    );
};
const PodaTab: React.FC<{ data: PointData, setData: (data: PointData) => void, isReadOnly: boolean }> = ({ data, setData, isReadOnly }) => {
    const update = (field: string, value: any) => setData(produce(data, draft => { if (!draft.poda) draft.poda = { realizada: false, tipo: null }; (draft.poda as any)[field] = value; }));
    return (
        <div className="space-y-4">
            <FormRow label="Poda Realizada?"><RadioGroup options={['Sim', 'Não']} value={data.poda?.realizada || false} onChange={val => isReadOnly ? null : update('realizada', val)} isBool /></FormRow>
            {data.poda?.realizada && <FormRow label="Tipo de Poda"><RadioGroup options={['Leve', 'Média', 'Pesada']} value={data.poda.tipo} onChange={val => isReadOnly ? null : update('tipo', val)} /></FormRow>}
        </div>
    );
};

// --- MAIN SCREEN ---
const WorkDetailScreen: React.FC<{ workId: string | null }> = ({ workId }) => {
    const { navigateTo, works, updateWorkPoint, addPointToWork, removePointFromWork, isAddingPoint, setIsAddingPoint } = useApp();
    const [viewMode, setViewMode] = useState<'budgeted' | 'execution'>('execution');
    const [selectedPoint, setSelectedPoint] = useState<ProjectPoint | null>(null);
    const [editingPointData, setEditingPointData] = useState<PointData | null>(null);
    const [activeTab, setActiveTab] = useState<'poste' | 'aterramento' | 'paraRaio' | 'equipamento' | 'poda'>('poste');
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);

    const work = useMemo(() => works.find(w => w.id === workId), [works, workId]);

    useEffect(() => {
        if (selectedPoint) {
            const dataToShow = viewMode === 'budgeted' ? selectedPoint.budgetedData : selectedPoint.executedData;
            setEditingPointData(JSON.parse(JSON.stringify(dataToShow)));
            setActiveTab('poste');
        } else {
            setEditingPointData(null);
        }
    }, [selectedPoint, viewMode]);
    
    useEffect(() => {
        return () => setIsAddingPoint(false);
    }, [setIsAddingPoint]);

    const handleSavePoint = () => {
        if (!editingPointData || !selectedPoint || !work) return;
        updateWorkPoint(work.id, selectedPoint.id, editingPointData);
        setSelectedPoint(null);
    };

    const handleRemovePoint = () => {
        if (!selectedPoint || !work) return;
        if (window.confirm(`Tem certeza que deseja remover o Ponto ${selectedPoint.number}?`)) {
            removePointFromWork(work.id, selectedPoint.id);
            setSelectedPoint(null);
        }
    };
    
    const mapBounds = useMemo(() => {
        if (!work || work.points.length === 0) return null;
        const points = work.points.map(p => [p.coordinates.lat, p.coordinates.lng] as [number, number]);
        return L.latLngBounds(points);
    }, [work]);
    
    const isPodaOnly = editingPointData?.poda?.realizada === true;
    const hasOtherData = !!(editingPointData?.poste || editingPointData?.aterramento || editingPointData?.paraRaio || (editingPointData?.equipamentos && editingPointData.equipamentos.length > 0));

    if (!work) return <MobileLayout title="Obra"><div className="p-4 text-center"><p>Obra não encontrada.</p></div></MobileLayout>;

    const renderTabContent = () => {
        if (!editingPointData) return null;
        const isReadOnly = viewMode === 'budgeted';
        switch (activeTab) {
            case 'poste': return <PosteTab data={editingPointData} setData={setEditingPointData} isReadOnly={isReadOnly} />;
            case 'aterramento': return <AterramentoTab data={editingPointData} setData={setEditingPointData} isReadOnly={isReadOnly} />;
            case 'paraRaio': return <ParaRaioTab data={editingPointData} setData={setEditingPointData} isReadOnly={isReadOnly} />;
            case 'equipamento': return <EquipamentoTab data={editingPointData} setData={setEditingPointData} isReadOnly={isReadOnly} />;
            case 'poda': return <PodaTab data={editingPointData} setData={setEditingPointData} isReadOnly={isReadOnly} />;
            default: return null;
        }
    };

    return (
        <MobileLayout title={work.code} showTitle={false}>
            <div className="relative w-full h-full flex flex-col">
                {/* Header Controls */}
                <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                         <button onClick={() => navigateTo('works_list')} className="bg-card/90 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-border"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
                         <div className="flex gap-1 bg-card/90 backdrop-blur-sm p-1 rounded-lg shadow-lg border border-border">
                            <button onClick={() => setViewMode('budgeted')} className={cn("btn px-3 py-1.5 text-sm flex items-center gap-1", viewMode === 'budgeted' ? 'btn-primary' : 'bg-transparent')}><Eye className="w-4 h-4"/><span>Orçado</span></button>
                            <button onClick={() => setViewMode('execution')} className={cn("btn px-3 py-1.5 text-sm flex items-center gap-1", viewMode === 'execution' ? 'btn-primary' : 'bg-transparent')}><Edit3 className="w-4 h-4"/><span>Executar</span></button>
                        </div>
                    </div>
                    <button className="btn btn-primary px-4 py-2.5 shadow-lg flex items-center gap-2"><Save className="w-4 h-4" /> <span>Salvar Obra</span></button>
                </div>
                
                {/* Map */}
                <div className={cn("flex-1 bg-muted", isAddingPoint && "cursor-crosshair")}>
                    {mapBounds && (
                        <MapContainer scrollWheelZoom={true} className="w-full h-full" zoomControl={false}>
                            <ChangeView bounds={mapBounds} />
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                            <MapEvents workId={work.id} onPointSelect={setSelectedPoint} points={work.points} />
                            
                            {work.extensions.map(ext => {
                                const from = work.points.find(p => p.id === ext.fromPointId);
                                const to = work.points.find(p => p.id === ext.toPointId);
                                if (!from || !to) return null;
                                return <Polyline key={ext.id} positions={[[from.coordinates.lat, from.coordinates.lng], [to.coordinates.lat, to.coordinates.lng]]} pathOptions={{ color: ext.tensao === 'alta' ? 'red' : 'green', weight: 3 }} />;
                            })}

                            {work.points.map(point => (
                                <Marker key={point.id} position={[point.coordinates.lat, point.coordinates.lng]} icon={createPointIcon(point)} eventHandlers={{ click: () => setSelectedPoint(point) }} />
                            ))}
                            <RecenterButton bounds={mapBounds} />
                        </MapContainer>
                    )}
                </div>

                {/* Add Point Button */}
                {viewMode === 'execution' && !isAddingPoint && (<button onClick={() => setIsAddingPoint(true)} className="absolute bottom-28 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform z-[1000]"><Plus className="w-7 h-7" /></button>)}

                 {isAddingPoint && (<div className="absolute inset-0 bg-black/50 z-[1001] flex flex-col items-center justify-center text-white p-4 text-center backdrop-blur-sm"><MousePointerClick className="w-10 h-10 mb-2" /><h3 className="font-bold text-lg">Modo de Adição</h3><p>Toque no mapa para adicionar um novo ponto.</p><button onClick={() => setIsAddingPoint(false)} className="mt-4 bg-white/20 px-4 py-2 rounded-lg">Cancelar</button></div>)}
                
                {/* Bottom Sheet */}
                <div className="absolute bottom-0 left-0 right-0 z-[1000] flex flex-col">
                    <div className="w-full bg-card/95 backdrop-blur-sm rounded-t-2xl shadow-2xl border-t border-border">
                        <button onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)} className="w-full p-2 flex justify-center items-center">
                            {isBottomSheetOpen ? <ChevronDown className="w-6 h-6 text-muted-foreground" /> : <ChevronUp className="w-6 h-6 text-muted-foreground" />}
                        </button>
                        {isBottomSheetOpen && (
                            <div className="max-h-[30vh] overflow-auto px-4 pb-4">
                                <h3 className="font-semibold text-foreground mb-3">Pontos ({work.points.length})</h3>
                                <div className="space-y-2">
                                    {work.points.map(point => {
                                        const hasPoda = point.executedData?.poda?.realizada;
                                        return (
                                            <button key={point.id} onClick={() => setSelectedPoint(point)} className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-muted">
                                                <div className={cn("w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm", pointStatusColors[point.status])}>
                                                    {hasPoda ? <TreeDeciduous className="w-5 h-5 text-white" /> : point.number}
                                                </div>
                                                <div className="flex-1 text-left"><p className="font-medium">Ponto {point.number}</p></div>
                                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Point Detail Modal */}
                {selectedPoint && editingPointData && (
                    <div className="fixed inset-0 z-[1100] bg-background/80 backdrop-blur-sm" onClick={() => setSelectedPoint(null)}>
                        <div className="absolute inset-x-0 bottom-0 bg-card rounded-t-2xl shadow-lg max-h-[95vh] flex flex-col border-t border-border" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0"><h3 className="text-lg font-semibold">Ponto {selectedPoint.number}</h3><button onClick={() => setSelectedPoint(null)} className="p-2 bg-muted rounded-full"><X className="w-5 h-5" /></button></div>
                            
                            <div className="grid grid-cols-5 gap-1 p-2 border-b border-border flex-shrink-0">
                                <TabButton label="Poste" icon={<TowerControl className="w-5 h-5"/>} isActive={activeTab === 'poste'} onClick={() => setActiveTab('poste')} disabled={isPodaOnly}/>
                                <TabButton label="Aterramento" icon={<Sprout className="w-5 h-5"/>} isActive={activeTab === 'aterramento'} onClick={() => setActiveTab('aterramento')} disabled={isPodaOnly}/>
                                <TabButton label="Para-raio" icon={<Zap className="w-5 h-5"/>} isActive={activeTab === 'paraRaio'} onClick={() => setActiveTab('paraRaio')} disabled={isPodaOnly}/>
                                <TabButton label="Equipamento" icon={<ToyBrick className="w-5 h-5"/>} isActive={activeTab === 'equipamento'} onClick={() => setActiveTab('equipamento')} disabled={isPodaOnly}/>
                                <TabButton label="Poda" icon={<TreeDeciduous className="w-5 h-5"/>} isActive={activeTab === 'poda'} onClick={() => setActiveTab('poda')} disabled={hasOtherData}/>
                            </div>

                            <div className="flex-1 overflow-auto p-4 space-y-4">
                                {renderTabContent()}
                            </div>
                            
                            <div className="p-4 border-t border-border mt-auto flex-shrink-0 flex gap-2">
                               {viewMode === 'execution' && <button onClick={handleRemovePoint} className="btn bg-destructive/10 text-destructive px-4 py-3"><Trash2 className="w-5 h-5" /></button>}
                               <button onClick={viewMode === 'execution' ? handleSavePoint : () => setSelectedPoint(null)} className="btn btn-primary w-full py-3">
                                   {viewMode === 'execution' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Check className="w-5 h-5" />
                                            <span>Salvar Ponto</span>
                                        </span>
                                   ) : (
                                        <span>Fechar</span>
                                   )}
                               </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
};

export default WorkDetailScreen;