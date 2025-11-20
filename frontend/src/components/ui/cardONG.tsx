import {IoLocationOutline} from "react-icons/io5";

interface CardONGProps {
    image?: string;
    nome: string;
    endereco: string;
    descricao: string;
    publicoAlvo: string[];
    necessidades: string[];
}

const CardONG = ({image, nome, endereco, descricao, publicoAlvo, necessidades}: CardONGProps) => {
    return (
        <div className="flex flex-col gap-2 p-3 border border-[#EFEFF0] rounded-xl pb-4">
            {image && (
                <img
                    src={image}
                    alt={`Imagem da ONG ${nome}`}
                    className="h-32 w-full rounded-xl object-cover"
                />
            )}

            <h2 className="text-lg font-medium">{nome}</h2>

            <div className="flex gap-1 items-center">
                <IoLocationOutline className="text-[#61646B]"/>
                <span className="text-sm text-[#61646B]">{endereco}</span>
            </div>

            <p className="text-sm py-4 truncate">
                {descricao}
            </p>

            <div className="flex gap-1 items-center max-h-16 overflow-x-scroll overflow-y-hidden">
                {publicoAlvo.map((item, index) => (
                    <div
                        key={index}
                        className="bg-[#EFEFF0] text-sm text-[#19191B] py-2 px-6 rounded-full inline-flex whitespace-nowrap"
                    >
                        {item}
                    </div>
                ))}
                {necessidades.map((item, index) => (
                    <div
                        key={index}
                        className="bg-[#EFEFF0] text-sm text-[#19191B] py-2 px-6 rounded-full inline-flex whitespace-nowrap"
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};

export {CardONG};