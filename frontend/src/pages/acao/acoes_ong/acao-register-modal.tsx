import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {ReactNode, useEffect} from "react";
import {api} from "@/utils/api.ts";
import {useParams} from "react-router-dom";
import {useQueryClient} from "react-query";

const acaoOngSchema = z.object({
    nome: z.string().min(3, {message: "Insira um nome maior"}),
    dia: z.number().min(1, {message: "Escolha uma data válida"}).max(31, {message: "Escolha uma data válida"}),
    mes: z.string(),
    ano: z.number().min(2025, {message: "Escolha uma data válida"}),
    inicio: z.string().min(3, {message: "Informe o ínicio"}),
    termino: z.string().min(3, {message: "Informe o término"}),
    cep: z.string(),
    bairro: z.string().min(3, {message: "Informe o bairro"}),
    endereco: z.string().min(1, {message: "Informe o endereço"}),
    numero: z.string().min(1, {message: "Informe o número"}),
    complemento: z.string(),
})

type AcaoOngSchema = z.infer<typeof acaoOngSchema>
export default function CreateAcaoModal({trigger}: { trigger: ReactNode }) {
    const {id} = useParams()
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: {isValid},
    } = useForm<AcaoOngSchema>({
        resolver: zodResolver(acaoOngSchema),
        mode: "onChange",
        defaultValues: {
            ano: new Date().getFullYear(),
            mes: new Date().toLocaleString("pt-BR", {month: "long"}).charAt(0).toUpperCase() +
                new Date().toLocaleString("pt-BR", {month: "long"}).slice(1),
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
                    if (!isValidCep) {
                        return;
                    }
                    const cleanedCep = cep.replace("-", "");
                    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
                    const data = await response.json();
                    setValue("endereco", data.logradouro)
                    setValue("bairro", data.bairro)
                } catch (er) {

                }
            }
        })()

    }, [cep]);


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    {trigger}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] w-11/12 bg-white rounded-xl overflow-y-scroll">
                <DialogHeader className="flex items-start">
                    <DialogTitle>Criar novo evento</DialogTitle>
                </DialogHeader>
                <div className={"flex flex-col gap-2"}>
                    <Label className={"text-[#191918]"}>
                        Nome
                    </Label>
                    <div className={"relative"}>
                        <Label className={"absolute text-[12px] left-3"}>
                            Título do evento
                        </Label>
                        <Input className={"pt-10 pb-6"} {...register("nome")}/>
                    </div>
                </div>
                <div className={"flex flex-col gap-2"}>
                    <Label className={"text-[#191918]"}>
                        Data
                    </Label>
                    <div className={"flex justify-between"}>
                        <div className={"relative"}>
                            <Label className={"absolute text-[12px] left-3"}>
                                Dia
                            </Label>
                            <Select>
                                <SelectTrigger className="w-20 border-[#AFB1B6] rounded-xl pt-10 pb-6">
                                    <SelectValue placeholder={getValues("dia")}
                                                 onChange={(e) => setValue("dia", e)}/>
                                </SelectTrigger>
                                <SelectContent className="bg-white font-normal text-[#61646B]">
                                    {Array.from({length: 31}, (_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                            {i + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={"relative"}>
                            <Label className={"absolute text-[12px] left-3"}>
                                Mês
                            </Label>
                            <Select>
                                <SelectTrigger className="w-32 border-[#AFB1B6] rounded-xl pt-10 pb-6">
                                    <SelectValue placeholder={getValues("mes")}
                                                 onChange={(e) => setValue("mes", e)}/>
                                </SelectTrigger>
                                <SelectContent className="bg-white font-normal text-[#61646B]">
                                    {[
                                        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                                        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                                    ].map((mes, index) => (
                                        <SelectItem key={index + 1} value={String(index + 1)}>
                                            {mes}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={"relative"}>
                            <Label className={"absolute text-[12px] left-3"}>
                                Ano
                            </Label>
                            <Select>
                                <SelectTrigger className="w-24 border-[#AFB1B6] rounded-xl pt-10 pb-6">
                                    <SelectValue placeholder={getValues("ano")}
                                                 onChange={(e) => setValue("ano", e)}/>
                                </SelectTrigger>
                                <SelectContent className="bg-white font-normal text-[#61646B]">
                                    {Array.from({length: 6}, (_, i) => (
                                        <SelectItem key={2025 + i} value={String(2025 + i)}>
                                            {2025 + i}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className={"flex flex-col gap-2"}>
                        <Label className={"text-[#191918]"}>
                            Horário
                        </Label>
                        <div className={"flex justify-between gap-4"}>
                            <div className={"relative"}>
                                <Label className={"absolute text-[12px] left-3"}>
                                    Início
                                </Label>
                                <Input className={"pt-10 pb-6"} defaultValue={"14:00"} {...register("inicio")}/>
                            </div>
                            <div className={"relative"}>
                                <Label className={"absolute text-[12px] left-3"}>
                                    Término
                                </Label>
                                <Input className={"pt-10 pb-6"} defaultValue={"15:00"}  {...register("termino")}/>
                            </div>
                        </div>

                    </div>
                </div>
                <div className={"flex flex-col gap-4"}>
                    <Label className={"text-[#191918]"}>
                        Localização
                    </Label>
                    <div className={"flex gap-4"}>
                        <div className={"relative"}>
                            <Label className={"absolute text-[12px] left-3"}>
                                CEP
                            </Label>
                            <Input className={"pt-10 pb-6"}  {...register("cep")}/>
                        </div>
                        <div className={"relative"}>
                            <Label className={"absolute text-[12px] left-3"}>
                                Bairro
                            </Label>
                            <Input className={"pt-10 pb-6"}  {...register("bairro")}/>
                        </div>
                    </div>
                    <div className={"relative"}>
                        <Label className={"absolute text-[12px] left-3"}>
                            Endereço
                        </Label>
                        <Input className={"w-full pt-10 pb-6"}  {...register("endereco")}/>
                    </div>
                    <div className={"flex gap-4"}>
                        <div className={"relative"}>
                            <Label className={"absolute text-[12px] left-3"}>
                                Número
                            </Label>
                            <Input className={"pt-10 pb-6"}  {...register("numero")}/>
                        </div>
                        <div className={"relative"}>
                            <Label className={"absolute text-[12px] left-3"}>
                                Complemento
                            </Label>
                            <Input className={"pt-10 pb-6"}  {...register("complemento")}/>
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button onClick={async () => {
                            await handleSubmit(onSubmit)();
                        }} disabled={!isValid}>
                            Criar evento
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}