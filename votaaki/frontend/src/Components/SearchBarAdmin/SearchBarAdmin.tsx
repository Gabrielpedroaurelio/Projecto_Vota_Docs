import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import style from './SearchBarAdmin.module.css';

interface SearchBarProps {
    onSearch?: (value: string) => void;
    placeholder?: string;
}

export default function SearchBarAdmin({ onSearch, placeholder = "Buscar enquetes disponíveis..." }: SearchBarProps) {
    return (
        <div className={style.container}>
            <div className={style.searchWrapper}>
                <HiOutlineMagnifyingGlass className={style.searchIcon} />
                <input 
                    type="text" 
                    placeholder={placeholder}
                    className={style.searchInput}
                    onChange={(e) => onSearch?.(e.target.value)}
                />
            </div>
        </div>
    );
}