import { useReducer, useEffect, createContext, useContext, useCallback, useMemo } from 'react'

interface Pokemon {
    id: number;
    name: string;
    type: string[];
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
}

type PokemonState = {
    pokemon: Pokemon[],
    search: string,
}

type PokemonActions =
    | { type: "setPokemon"; payload: Pokemon[] }
    | { type: 'setSearch'; payload: string };

const PokemonContext = createContext<ReturnType<typeof usePokemonSource>>({} as unknown as ReturnType<typeof usePokemonSource>);

function usePokemonSource(): { pokemon: Pokemon[], search: string, setSearch: (search: string) => void, } {

    const [{ pokemon, search }, dispatch] = useReducer((state: PokemonState, action: PokemonActions) => {
        switch (action.type) {
            case "setPokemon":
                return { ...state, pokemon: action.payload };
            case 'setSearch':
                return { ...state, search: action.payload }
        }
    }, {
        pokemon: [],
        search: '',
    })

    useEffect(() => {
        fetch('./pokemon.json')
            .then(resp => resp.json())
            .then(resp => dispatch({ type: 'setPokemon', payload: resp }))
    }, [])

    const setSearch = useCallback((search: string) => {
        dispatch({
            type: 'setSearch',
            payload: search
        })
    }, []);

    const filteredPokemon = useMemo(() => {
        return pokemon.filter(p => p.name.toLowerCase().includes(search))
    }, [pokemon, search]);

    const sortedPokemon = useMemo(() => {
        return [...filteredPokemon].sort((a, b) => a.name.localeCompare(b.name))
    }, [filteredPokemon])

    return { pokemon: sortedPokemon, search, setSearch }
}

export const usePokemon = () => {
    return useContext(PokemonContext);
}

export function PokemonProvider({ children }: { children: React.ReactNode }) {
    return (
        <PokemonContext.Provider value={usePokemonSource()}>
            {children}
        </PokemonContext.Provider>
    )
}