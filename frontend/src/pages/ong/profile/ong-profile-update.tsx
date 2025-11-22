import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { api } from "@/utils/api.ts";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FaArrowLeft } from "react-icons/fa";
import { TbEdit, TbTrash } from "react-icons/tb";
import { Label } from "@/components/ui/label.tsx";
import { toast } from "react-toastify";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose
} from "@/components/ui/dialog.tsx";
import { FiEye, FiEyeOff } from "react-icons/fi";

// --- SCHEMAS ---
const ongUpdateSchema = z.object({
    nome: z.string().min(2, { message: "Nome inválido" }),
    endereco: z.string().optional(), // Campo de endereço
    added_publico_alvo: z.array(z.string()),
    removed_publico_alvo: z.array(z.string()),
    added_necessidades: z.array(z.string()),
    removed_necessidades: z.array(z.string()),
});

// --- OPÇÕES ---
const publicoAlvoOptions = [
    "Crianças", "Adolescentes", "Adultos", "Idosos", "Homens", 
    "Mulheres", "Animais", "População negra", "População Indígena", 
    "LGBTQIA+", "Pessoas com Deficiência"
];

const necessidadesOptions = [
    "Assistência Social", "Educação", "Saúde", "Saúde Mental", 
    "Meio Ambiente", "Combate à Pobreza", "Cultura e Arte", 
    "Igualdade de Gênero", "Direitos Humanos", "Justiça Social", 
    "Esporte e Lazer", "Desenvolvimento Comunitário", "Emergências", "Emprego"
];

export default function OngProfileUpdate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // Estados Locais
    const [viewPassword, setViewPassword] = useState(false);
    const [viewConfirmPassword, setViewConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [selectedPublico, setSelectedPublico] = useState<string[]>([]);
    const [selectedNecessidades, setSelectedNecessidades] = useState<string[]>([]);
    
    // Modais
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // 1. Buscar Dados
    const { data: ongData, isLoading } = useQuery(["ong_profile", id], async () => {
        const res = await api.get(`/v1/ong/${id}`);
        return res.data;
    });

    // 2. Configurar Formulário
    const { register, handleSubmit, setValue, getValues, formState: { isDirty } } = useForm({
        resolver: zodResolver(ongUpdateSchema),
        defaultValues: {
            nome: "",
            endereco: "",
            added_publico_alvo: [],
            removed_publico_alvo: [],
            added_necessidades: [],
            removed_necessidades: []
        }
    });

    // 3. Sincronizar dados
    useEffect(() => {
        if (ongData) {
            setValue("nome", ongData.nome);
            setValue("endereco", ongData.endereco || ""); // AQUI: Garante que puxa o endereço, não o login
            setSelectedPublico(ongData.publico_alvo.map((p: any) => p.tipo));
            setSelectedNecessidades(ongData.necessidades.map((n: any) => n.tipo));
        }
    }, [ongData, setValue]);

    // Lógica de Alteração
    const tagsChanged = useMemo(() => {
        if (!ongData) return false;
        const originalPublico = ongData.publico_alvo.map((p: any) => p.tipo).sort().join(',');
        const currentPublico = [...selectedPublico].sort().join(',');
        const originalNecessidades = ongData.necessidades.map((n: any) => n.tipo).sort().join(',');
        const currentNecessidades = [...selectedNecessidades].sort().join(',');

        return originalPublico !== currentPublico || originalNecessidades !== currentNecessidades;
    }, [selectedPublico, selectedNecessidades, ongData]);

    const hasUnsavedChanges = isDirty || tagsChanged;

    // 4. Lógica de Toggle
    const toggleTag = (tag: string, type: 'publico_alvo' | 'necessidades') => {
        const currentList = type === 'publico_alvo' ? selectedPublico : selectedNecessidades;
        const setList = type === 'publico_alvo' ? setSelectedPublico : setSelectedNecessidades;
        const dbKey = type; 

        const isSelected = currentList.includes(tag);

        if (isSelected) {
            setList(currentList.filter(t => t !== tag));
            const originalItem = ongData[dbKey].find((i: any) => i.tipo === tag);
            if (originalItem) {
                const removed = getValues(`removed_${type}`) as string[];
                setValue(`removed_${type}`, [...removed, originalItem.id]);
            } else {
                const added = getValues(`added_${type}`) as string[];
                setValue(`added_${type}`, added.filter(t => t !== tag));
            }
        } else {
            setList([...currentList, tag]);
            const originalItem = ongData[dbKey].find((i: any) => i.tipo === tag);
            if (originalItem) {
                const removed = getValues(`removed_${type}`) as string[];
                setValue(`removed_${type}`, removed.filter(id => id !== originalItem.id));
            } else {
                const added = getValues(`added_${type}`) as string[];
                setValue(`added_${type}`, [...added, tag]);
            }
        }
    };

    const onSubmit = async (data: any) => {
        try {
            await api.put(`/v1/ong/${id}`, data);
            toast.success("Informações atualizadas!");
            queryClient.invalidateQueries(["ong_profile"]);
            setIsSaveDialogOpen(false);
            navigate(`/ong/admin/${id}`);
        } catch (e) {
            toast.error("Erro ao salvar informações.");
            setIsSaveDialogOpen(false);
        }
    };

    const handleBackClick = () => {
        if (hasUnsavedChanges) {
            setIsExitDialogOpen(true);
        } else {
            navigate(`/ong/admin/${id}`);
        }
    };

    const handleChangePassword = async () => {
        try {
            await api.put(`/v1/ong/${id}/password`, { password: newPassword });
            toast.success("Senha alterada com sucesso!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (e) {
            toast.error("Erro ao alterar senha.");
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete(`/v1/ong/${id}`);
            toast.success("Conta excluída com sucesso.");
            localStorage.clear();
            navigate("/login");
        } catch (e) {
            toast.error("Erro ao excluir conta.");
        }
    };

    if (isLoading || !ongData) return <div className="min-h-screen bg-white"></div>;

    const inputClass = "h-12 rounded-xl border-gray-200 bg-white text-gray-700 shadow-sm focus-visible:ring-0 focus-visible:border-blue-500";

    return (
        <div className="min-h-screen bg-white flex flex-col">
            
            {/* HEADER AZUL */}
            <header className="w-full h-12 bg-blue-600 flex items-center px-4 justify-between shadow-md sticky top-0 z-20">
                <Button variant="ghost" size="icon" onClick={handleBackClick} className="text-white hover:bg-blue-700">
                    <FaArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-white font-semibold text-lg tracking-wide">Configurações</h1>
                <div className="w-10"></div> 
            </header>

            {/* CONTEÚDO */}
            <main className="flex-1 px-6 py-8 flex flex-col gap-8 pb-32">
                
                {/* 1. Dados da Conta */}
                <section className="flex flex-col gap-5">
                    <div className="border-b border-gray-100 pb-2">
                        <h3 className="text-gray-900 font-semibold text-lg">Dados da Conta</h3>
                    </div>
                    
                    {/* Campo NOME */}
                    <div className="space-y-1.5">
                        <Label className="text-gray-500 font-normal ml-1 text-sm">Nome da ONG</Label>
                        <Input {...register("nome")} className={inputClass} autoComplete="off" />
                    </div>

                    {/* Campo ENDEREÇO (Corrigido) */}
                    <div className="space-y-1.5">
                        <Label className="text-gray-500 font-normal ml-1 text-sm">Endereço</Label>
                        <Input 
                            {...register("endereco")} 
                            className={inputClass} 
                            placeholder="Rua, Bairro, Cidade..." 
                            autoComplete="off" // Evita que o navegador preencha com email
                        />
                    </div>

                    {/* Campo LOGIN (Email) - Desabilitado e separado */}
                    <div className="space-y-1.5">
                        <Label className="text-gray-500 font-normal ml-1 text-sm">Login (Email)</Label>
                        <Input 
                            value={ongData.login} 
                            disabled 
                            className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} 
                        />
                    </div>
                </section>

                {/* 2. Público Alvo */}
                <section className="flex flex-col gap-4">
                    <div className="border-b border-gray-100 pb-2">
                        <h3 className="text-gray-900 font-semibold text-lg">Público Alvo</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {publicoAlvoOptions.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag, 'publico_alvo')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                    selectedPublico.includes(tag)
                                    ? "bg-[#FFCF33] border-[#FFCF33] text-gray-900 shadow-sm scale-105 font-semibold"
                                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. Causas */}
                <section className="flex flex-col gap-4">
                    <div className="border-b border-gray-100 pb-2">
                        <h3 className="text-gray-900 font-semibold text-lg">Causas</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {necessidadesOptions.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag, 'necessidades')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                    selectedNecessidades.includes(tag)
                                    ? "bg-[#FFCF33] border-[#FFCF33] text-gray-900 shadow-sm scale-105 font-semibold"
                                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 4. Opções de Conta */}
                <section className="flex flex-col gap-3">
                    {/* Alterar Senha */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="flex justify-between items-center py-4 px-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition border border-gray-100">
                                <span className="text-gray-700 font-medium">Alterar Senha de Acesso</span>
                                <TbEdit className="text-gray-400 w-5 h-5" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="bg-white rounded-2xl w-[90%] max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                            <DialogHeader><DialogTitle>Alterar Senha</DialogTitle></DialogHeader>
                            <div className="flex flex-col gap-4 py-2">
                                <div className="space-y-1">
                                    <Label>Nova Senha</Label>
                                    <div className="relative">
                                        <Input type={viewPassword ? "text" : "password"} className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                        <button onClick={() => setViewPassword(!viewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{viewPassword ? <FiEyeOff /> : <FiEye />}</button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Confirmar Senha</Label>
                                    <div className="relative">
                                        <Input type={viewConfirmPassword ? "text" : "password"} className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                        <button onClick={() => setViewConfirmPassword(!viewConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{viewConfirmPassword ? <FiEyeOff /> : <FiEye />}</button>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter><Button onClick={handleChangePassword} className="w-full rounded-full bg-blue-600 hover:bg-blue-700 font-semibold" disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 8}>Salvar Nova Senha</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Excluir Conta */}
                    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                        <DialogTrigger asChild>
                            <div className="flex justify-between items-center py-4 px-4 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition border border-red-100">
                                <span className="text-red-600 font-medium">Excluir Conta</span>
                                <TbTrash className="text-red-400 w-5 h-5" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="bg-white rounded-2xl w-[90%] max-w-sm fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                            <DialogHeader>
                                <DialogTitle className="text-red-600">Excluir Conta?</DialogTitle>
                                <DialogDescription>Tem certeza que deseja excluir permanentemente sua conta e todos os dados? Essa ação não pode ser desfeita.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-full flex-1">Cancelar</Button>
                                <Button onClick={handleDeleteAccount} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white rounded-full flex-1">Sim, Excluir</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </section>

            </main>

            {/* RODAPÉ FIXO */}
            <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0 z-30 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
                <Button onClick={() => setIsSaveDialogOpen(true)} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-base shadow-lg shadow-blue-200 transition-transform active:scale-95">
                    Salvar Alterações
                </Button>
            </div>

            {/* MODAL SALVAR */}
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogContent className="bg-white rounded-2xl w-[90%] max-w-sm fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                    <DialogHeader>
                        <DialogTitle>Tem certeza?</DialogTitle>
                        <DialogDescription>Deseja salvar todas as alterações feitas nos dados da ONG?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)} className="rounded-full flex-1">Cancelar</Button>
                        <Button onClick={handleSubmit(onSubmit)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full flex-1">Sim, Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL SAIR */}
            <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
                <DialogContent className="bg-white rounded-2xl w-[90%] max-w-sm fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                    <DialogHeader>
                        <DialogTitle>Descartar alterações?</DialogTitle>
                        <DialogDescription>Você tem alterações não salvas. Se sair agora, elas serão perdidas.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsExitDialogOpen(false)} className="rounded-full flex-1">Continuar editando</Button>
                        <Button onClick={() => navigate(`/ong/admin/${id}`)} variant="destructive" className="rounded-full flex-1 bg-red-500 hover:bg-red-600">Descartar e Sair</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}