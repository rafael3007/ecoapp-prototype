import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { ArrowLeft, Check, Camera, ChevronDown } from 'lucide-react';
import { ChecklistCategory, ChecklistItem } from '../../types';
import { cn } from '../../lib/utils';


const PhotoInput: React.FC<{ label: string, onUpload: (file: string) => void }> = ({ label, onUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onUpload(result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="mt-2">
            <label className="w-full aspect-video bg-muted rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer">
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <>
                        <Camera className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground mt-2">{label}</span>
                    </>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
            </label>
        </div>
    );
};

const ChecklistItemComponent: React.FC<{
    item: ChecklistItem;
    onAnswer: (answer: string | null) => void;
}> = ({ item, onAnswer }) => {
    switch (item.type) {
        case 'text':
            return <input type="text" value={item.answer || ''} onChange={(e) => onAnswer(e.target.value)} className="w-full input mt-2" />;
        case 'textarea':
            return <textarea value={item.answer || ''} onChange={(e) => onAnswer(e.target.value)} className="w-full input mt-2" rows={3}></textarea>;
        case 'radio':
            return <div className="flex gap-2 mt-2">{item.options?.map(opt => <button key={opt} onClick={() => onAnswer(opt)} className={cn("flex-1 py-2 px-3 rounded-lg text-sm border", item.answer === opt ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border")}>{opt}</button>)}</div>;
        case 'photo':
            return <PhotoInput label={item.question} onUpload={(file) => onAnswer(file)} />;
        default:
            return null;
    }
};

const CategoryAccordion: React.FC<{ category: ChecklistCategory, onAnswer: (itemId: string, answer: string | null) => void }> = ({ category, onAnswer }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="bg-card border border-border rounded-xl">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left">
                <h3 className="font-semibold">{category.title}</h3>
                <ChevronDown className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 space-y-4">
                    {category.items.map(item => (
                        <div key={item.id}>
                            <label className="text-sm font-medium text-muted-foreground">{item.question}</label>
                            <ChecklistItemComponent item={item} onAnswer={(answer) => onAnswer(item.id, answer)} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const APRChecklistScreen: React.FC = () => {
    const { navigateTo, aprChecklist, updateChecklistAnswer, completeChecklist } = useApp();

    const isComplete = useMemo(() => {
        if (!aprChecklist) return false;
        return aprChecklist.categories.every(cat => cat.items.every(item => item.answer !== null));
    }, [aprChecklist]);

    const handleAnswer = (categoryId: string, itemId: string, answer: string | null) => {
        updateChecklistAnswer('apr', categoryId, itemId, answer);
    };
    
    const handleSave = () => {
        completeChecklist('apr');
        navigateTo('open_shift');
    };

    if (!aprChecklist) return <MobileLayout title="Carregando..."><p>Carregando checklist...</p></MobileLayout>;

    return (
        <MobileLayout title={aprChecklist.title}>
            <div className="p-4 space-y-4 pb-24">
                <button onClick={() => navigateTo('open_shift')} className="flex items-center gap-2 text-muted-foreground"><ArrowLeft className="w-5 h-5" /><span>Voltar</span></button>
                {aprChecklist.categories.map(category => (
                    <CategoryAccordion key={category.id} category={category} onAnswer={(itemId, answer) => handleAnswer(category.id, itemId, answer)} />
                ))}
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/80 backdrop-blur-sm border-t border-border max-w-lg mx-auto">
                <button onClick={handleSave} disabled={!isComplete} className="w-full py-4 btn btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
                    <Check className="w-6 h-6" />
                    <span>Salvar e Concluir</span>
                </button>
            </div>
        </MobileLayout>
    );
};

export default APRChecklistScreen;