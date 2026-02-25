export interface UserLogin {
    email?: string,
    password?: string,
}
export interface UserRegister {
    name?: string,
    email?: string,
    password?: string,
}
export interface UserData {
    id_user?: number;
    name?: string;
    email?: string;
    path_thumb?: string;
    last_login?: string;
    status?: string;
    user_type?: string;
    create_at?: string;
    update_at?: string;
}

export interface AuthResponse {
    token: string;
    user: UserData;
}

export interface PollOption {
    id_opcao_voto: number;
    id_enquete_opcao_voto?: number; // Bridge ID from Enquete_Opcao_Voto
    designacao: string;
    descricao?: string;
    total_votos?: number;
}

export interface Poll {
    id_enquete: number;
    titulo: string;
    descricao?: string;
    data_inicio: string;
    data_fim?: string;
    status: 'ativa' | 'encerrada';
    criador: string;
    total_votos: number;
    opcoes?: PollOption[];
    usuario_ja_votou?: boolean;
}

export interface PollCardProps {
    enquete: Poll;
    onVote?: (id: string) => void;
}
