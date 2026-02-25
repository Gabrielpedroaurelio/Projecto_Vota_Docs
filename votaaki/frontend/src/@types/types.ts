export interface UserLogin {
    email?: string,
    password?: string,
}
export interface UserRegister {
    name?: string,
    email?: string,
    password?: string,
}
export interface User {
    id_user: number;
    name: string;
    email: string;
    path_thumb?: string;
    last_login: string | null;
    status: 'active' | 'inactive' | 'banned';
    user_type: 'admin' | 'user';
    created_at: string;
    updated_at?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface PollOption {
    id_option: number;
    id_poll_option?: number; // Bridge ID
    designation: string;
    description?: string;
    total_votes?: number;
}

export interface Poll {
    id_poll: number;
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    status: 'active' | 'closed';
    creator: string;
    total_votes: number;
    options?: PollOption[];
    user_voted?: boolean;
}

export interface PollCardProps {
    poll: Poll;
    onVote?: (id: string) => void;
}
