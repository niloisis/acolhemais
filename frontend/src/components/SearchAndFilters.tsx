import React from "react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CiSearch} from "react-icons/ci";

interface SearchAndFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    causePosition: string;
    onCauseChange: (value: string) => void;
    regionPosition: string;
    onRegionChange: (value: string) => void;
    sortPosition: string;
    onSortChange: (value: string) => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
                                                                      searchTerm,
                                                                      onSearchChange,
                                                                      causePosition,
                                                                      onCauseChange,
                                                                      regionPosition,
                                                                      onRegionChange,
                                                                      sortPosition,
                                                                      onSortChange,
                                                                  }) => {
    return (
        <>
            <section className={"flex mt-5 gap-2"}>
                <Input
                    className="rounded-full px-4 py-2 border border-gray-300"
                    placeholder="Pesquise"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <Button className={"h-8 w-12"}>
                    <CiSearch className={"h-6 w-6"}/>
                </Button>
            </section>

            {/*<section className="flex pt-4 gap-2">*/}
            {/*    <DropdownMenu>*/}
            {/*        <DropdownMenuTrigger asChild>*/}
            {/*            <Button className="whitespace-nowrap flex-1 min-w-0">*/}
            {/*                Causas <ChevronDownIcon className="h-6 w-6 text-blue-500" />*/}
            {/*            </Button>*/}
            {/*        </DropdownMenuTrigger>*/}
            {/*        <DropdownMenuContent className="w-56 !z-[9999]">*/}
            {/*            <DropdownMenuLabel>Selecione uma opção</DropdownMenuLabel>*/}
            {/*            <DropdownMenuSeparator />*/}
            {/*            <DropdownMenuRadioGroup value={causePosition} onValueChange={onCauseChange}>*/}
            {/*                <DropdownMenuRadioItem value="Causa 1">Causa 1</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Causa 2">Causa 2</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Causa 3">Causa 3</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Causa 4">Causa 4</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Causa 5">Causa 5</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Causa 6">Causa 6</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Causa 7">Causa 7</DropdownMenuRadioItem>*/}
            {/*            </DropdownMenuRadioGroup>*/}
            {/*        </DropdownMenuContent>*/}
            {/*    </DropdownMenu>*/}

            {/*    <DropdownMenu>*/}
            {/*        <DropdownMenuTrigger asChild>*/}
            {/*            <Button className="whitespace-nowrap flex-1 min-w-0">*/}
            {/*                Região <ChevronDownIcon className="h-6 w-6 text-blue-500" />*/}
            {/*            </Button>*/}
            {/*        </DropdownMenuTrigger>*/}
            {/*        <DropdownMenuContent className="w-56">*/}
            {/*            <DropdownMenuLabel>Selecione uma opção</DropdownMenuLabel>*/}
            {/*            <DropdownMenuSeparator />*/}
            {/*            <DropdownMenuRadioGroup value={regionPosition} onValueChange={onRegionChange}>*/}
            {/*                <DropdownMenuRadioItem value="Zona Norte">Zona Norte</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Zona Leste">Zona Leste</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Zona Oeste">Zona Oeste</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Zona Sul">Zona Sul</DropdownMenuRadioItem>*/}
            {/*            </DropdownMenuRadioGroup>*/}
            {/*        </DropdownMenuContent>*/}
            {/*    </DropdownMenu>*/}

            {/*    <DropdownMenu>*/}
            {/*        <DropdownMenuTrigger asChild>*/}
            {/*            <Button className="whitespace-nowrap flex-1 min-w-0">*/}
            {/*                Ordenar <ChevronDownIcon className="h-6 w-6 text-blue-500" />*/}
            {/*            </Button>*/}
            {/*        </DropdownMenuTrigger>*/}
            {/*        <DropdownMenuContent className="w-56">*/}
            {/*            <DropdownMenuLabel>Selecione uma opção</DropdownMenuLabel>*/}
            {/*            <DropdownMenuSeparator />*/}
            {/*            <DropdownMenuRadioGroup value={sortPosition} onValueChange={onSortChange}>*/}
            {/*                <DropdownMenuRadioItem value="A-Z">Classificar A-Z</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="Z-A">Classificar Z-A</DropdownMenuRadioItem>*/}
            {/*                <DropdownMenuRadioItem value="top">Classificar por Data</DropdownMenuRadioItem>*/}
            {/*            </DropdownMenuRadioGroup>*/}
            {/*        </DropdownMenuContent>*/}
            {/*    </DropdownMenu>*/}
            {/*</section>*/}
        </>
    );
};