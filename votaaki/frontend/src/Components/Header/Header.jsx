import { FaMagnifyingGlass } from "react-icons/fa6"
import { FaUser, FaBell } from "react-icons/fa6"
import { CiBellOn } from "react-icons/ci"
import style from './Header.module.css'
import { useState } from "react"
export default function Header({ titlepage, usuario, controllerBarSearch }) {
    const [hasNotification,setHasNotification]=useState(false)
    console.log(usuario);
    console.log(controllerBarSearch);
    console.log(setHasNotification());
    
    return (

        <>
            <header className={style.headercard}>
                <div className={style.cardtitle}>
                    <h2>{titlepage}</h2>
                </div>
                <div className={style.controllers}>
                    <div className={style.cardsearchBar}>
                        <FaMagnifyingGlass />
                        <input type="search" name="" id="" placeholder="Pesquisar..." />
                    </div>
                    <div className={style.cardTheme}>
                        <button>Claro</button>
                        <button>Escuro</button>
                    </div>
                    <div className={style.cardNotification}>
                        <button>
                            {
                                hasNotification?(
                                    <FaBell size={25}/>
                                ):(
                                    <CiBellOn size={30}/>
                                )
                            }
                        </button>
                        {
                            // area para colocar o painel de notificações
                        }
                    </div>
                    <div className={style.cardProfile}>
                        <div>
                            <img src="" alt="" />
                            <div>
                                <span>Gabriel Pedro Aurelio</span>
                                <small>gabrielpedroaurelio@gmail.com</small>
                            </div>
                        </div>
                        {
                            // area para colocar o painel de notificações
                        }
                    </div>
                </div>

            </header>

        </>
    )
}