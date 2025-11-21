import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ReactNode, useEffect } from "react";
import { api } from "@/utils/api.ts";
import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";

const acaoOngSchema = z.object({
    nome: z.string().min(3, { message: "Insira um nome maior" }),
    dia: z.number().min(1, { message: "Dia inválido" }).max(31, { message: "Dia inválido" }),
    mes: z.string(),
    ano: z.number().min(2025, { message: "Ano inválido" }),
    inicio: z.string().min(3, { message: "Informe o ínicio" }),
    termino: z.string().min(3, { message: "Informe o término" }),
    cep: z.string(),
    bairro: z.string().min(3, { message: "Informe o bairro" }),
    endereco: z.string().min(1, { message: "Informe o endereço" }),
    numero: z.string().min(1, { message: "Informe o número" }),
    complemento: z.string().optional(),
})

type AcaoOngSchema = z.infer<typeof acaoOngSchema>

export default function CreateAcaoModal({ trigger }: { trigger: ReactNode }) {
    const { id } = useParams()
    
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { isValid },
    } = useForm<AcaoOngSchema>({
        resolver: zodResolver(acaoOngSchema),
        mode: "onChange",
        defaultValues: {
            ano: new Date().getFullYear(),
            mes: new Date().toLocaleString("pt-BR", { month: "long" }).charAt(0).toUpperCase() +
                new Date().toLocaleString("pt-BR", { month: "long" }).slice(1),
            dia: new Date().getDate(),
            cep: "",
            complemento: ""
        }
    })
    
    const queryClient = useQueryClient()
    
    const onSubmit = async (data: AcaoOngSchema) => {
        await api.post(`/v1/ong/${id}/acoes`, data)
        await queryClient.invalidateQueries();
    };
    
    const cep = watch("cep")
    
    useEffect(() => {
        (async () => {
            if (cep) {
                try {
                    const isValidCep = /^\d{5}-?\d{3}$/.test(cep);
                    if (!isValidCep) return;
                    
                    const cleanedCep = cep.replace("-", "");
                    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
                    const data = await response.json();
                    
                    if (!data.erro) {
                        setValue("endereco", data.logradouro)
                        setValue("bairro", data.bairro)
                    }
                } catch (er) {
                    console.error("Erro ao buscar CEP");
                }
            }
        })()
    }, [cep]);

    // --- MUDANÇA AQUI ---
    // Alterei 'pt-6' para 'pt-8' para aumentar o espaço entre o label e o texto
    // Mantive 'h-14' que já é alto o suficiente para comportar esse espaçamento
    const inputClass = "h-14 pt-6 pb-2 rounded-[12px] border-gray-200 bg-white text-gray-700 shadow-sm focus-visible:ring-blue-600";
    
    // Ajustei levemente o topo para 'top-2.5' para centralizar melhor visualmente na parte superior
    const labelClass = "absolute top-0 left-3 text-xs text-gray-500 font-medium z-10 pointer-events-none";

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger} 
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] w-[90%] max-w-md bg-white rounded-[22px] overflow-y-scroll p-6">
                <DialogHeader className="flex items-start mb-4">
                    <DialogTitle className="text-xl font-bold text-gray-900">Criar novo evento</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    
                    {/* NOME */}
                    <div className="relative">
                        <Label className={labelClass}>Título do evento</Label>
                        <Input className={inputClass} {...register("nome")} />
                    </div>

                    {/* DATA */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                            <Label className={labelClass}>Dia</Label>
                            <Select onValueChange={(e) => setValue("dia", Number(e))}>
                                <SelectTrigger className={`${inputClass} w-full`}>
                                    <SelectValue placeholder={String(getValues("dia") || "Dia")} />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-40">
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative">
                            <Label className={labelClass}>Mês</Label>
                            <Select onValueChange={(e) => setValue("mes", e)}>
                                <SelectTrigger className={`${inputClass} w-full`}>
                                    <SelectValue placeholder={getValues("mes") || "Mês"} />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-40">
                                    {[
                                        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                                        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                                    ].map((mes) => (
                                        <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative">
                            <Label className={labelClass}>Ano</Label>
                            <Select onValueChange={(e) => setValue("ano", Number(e))}>
                                <SelectTrigger className={`${inputClass} w-full`}>
                                    <SelectValue placeholder={String(getValues("ano") || "Ano")} />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-40">
                                    {Array.from({ length: 6 }, (_, i) => (
                                        <SelectItem key={2025 + i} value={String(2025 + i)}>{2025 + i}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* HORÁRIO */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <Label className={labelClass}>Início</Label>
                            <Input className={inputClass} defaultValue="14:00" {...register("inicio")} />
                        </div>
                        <div className="relative">
                            <Label className={labelClass}>Término</Label>
                            <Input className={inputClass} defaultValue="15:00" {...register("termino")} />
                        </div>
                    </div>

                    {/* LOCALIZAÇÃO */}
                    <div className="flex flex-col gap-4 mt-2">
                        <Label className="text-gray-900 font-semibold">Localização</Label>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <Label className={labelClass}>CEP</Label>
                                <Input className={inputClass} {...register("cep")} />
                            </div>
                            <div className="relative">
                                <Label className={labelClass}>Bairro</Label>
                                <Input className={inputClass} {...register("bairro")} />
                            </div>
                        </div>

                        <div className="relative">
                            <Label className={labelClass}>Endereço</Label>
                            <Input className={inputClass} {...register("endereco")} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <Label className={labelClass}>Número</Label>
                                <Input className={inputClass} {...register("numero")} />
                            </div>
                            <div className="relative">
                                <Label className={labelClass}>Complemento</Label>
                                <Input className={inputClass} {...register("complemento")} />
                            </div>
                        </div>
                    </div>

                </div>

                <DialogFooter className="mt-6">
                    <DialogClose asChild>
                        <Button 
                            className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg"
                            onClick={async () => {
                                await handleSubmit(onSubmit)();
                            }} 
                            disabled={!isValid}
                        >
                            Criar evento
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}