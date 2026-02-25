import { FaMagnifyingGlass } from 'react-icons/fa6'
import style from './SearchBarAdmin.module.css'
import { MdAutoAwesome } from 'react-icons/md'
export default function SearchBarAdmin() {
    return (
        <>
            <div className={style.CardSeachBar}>
               <div>
                 <div className={style.SearchBar}>
                    <FaMagnifyingGlass />
                    <input type="text" placeholder="No que estas a pensar" />
                </div>
                <button><MdAutoAwesome /></button>
               </div>

            </div>
        </>
    )
}