import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { ArrowLeft, Check, Camera, ChevronDown, User } from 'lucide-react';
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
            <label className="w-full aspect-square max-w-[200px] mx-auto bg-muted rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <User className="w-12 h-12 text-muted-foreground" />
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


const IndividualChecklistScreen: React.FC<{ memberId: string | null }> = ({ memberId }) => {
    const { navigateTo, individualChecklists, updateChecklistAnswer, completeChecklist } = useApp();

    const checklist = memberId ? individualChecklists[memberId] : null;

    const isComplete = useMemo(() => {
        if (!checklist) return false;
        return checklist.categories.every(cat => cat.items.every(item => item.answer !== null));
    }, [checklist]);

    const handleAnswer = (categoryId: string, itemId: string, answer: string | null) => {
        if (!memberId) return;
        updateChecklistAnswer(memberId, categoryId, itemId, answer);
    };
    
    const handleSave = () => {
        if (!memberId) return;
        completeChecklist(memberId);
        navigateTo('open_shift');
    };

    if (!checklist) return <MobileLayout title="Carregando..."><p>Checklist não encontrado.</p></MobileLayout>;

    return (
        <MobileLayout title={checklist.title}>
            <div className="p-4 space-y-4 pb-24">
                <button onClick={() => navigateTo('open_shift')} className="flex items-center gap-2 text-muted-foreground"><ArrowLeft className="w-5 h-5" /><span>Voltar</span></button>
                {checklist.categories.map(category => (
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

export default IndividualChecklistScreen;