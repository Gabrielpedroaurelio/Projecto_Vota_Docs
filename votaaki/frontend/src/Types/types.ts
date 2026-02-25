interface UserLogin {
    email?: string,
    password?: string,
}
interface UserRegister {
    name?: string,
    email?: string,
    password?: string,
}
interface UserData {
    id_user?:BigInteger,
    name?:string,
    email?:string,
    path_thumb?:string,
    last_login?:string,
    status?:string,
    user_type?:string,
    create_at?:string,
    update_at?:string,
}
interface UserEditProfile { }