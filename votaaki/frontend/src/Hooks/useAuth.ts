import { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';

export function useAuth() {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
}
