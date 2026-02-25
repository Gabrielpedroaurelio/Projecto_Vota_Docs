import { FaMagnifyingGlass } from 'react-icons/fa6'
import style from './SearchBarAdmin.module.css'
export default function SearchBarAdmin() {
    return (
        <>
            <div className={style.CardSeachBar}>
           
                 <div className={style.SearchBar}>
                    
                    <input type="text" placeholder={`Buscar Enquetes....`} />
                </div>
    
           

            </div>
        </>
    )
}