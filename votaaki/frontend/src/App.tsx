import './assets/style.global.css'
import Routers from './Routers/Router'
import { AuthProvider } from './Contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routers />
    </AuthProvider>
  );
}

export default App;
