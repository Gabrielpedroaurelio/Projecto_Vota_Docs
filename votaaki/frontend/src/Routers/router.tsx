import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../Pages/Public/Main/Main";
import PollVote from "../Pages/Public/PollVote/PollVote";
import Auth from "../Pages/Public/Auth/Auth";
import Dashboard from "../Pages/Admin/Dashboard/Dashboard";
import PrivateRoute from "./PrivateRoute";

export default function Routers() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Main />} />
                <Route path="/vote/:id" element={<PollVote />} />
                <Route path="/auth" element={<Auth />} />

                {/* Admin Routes */}
                {/*<Route element={<PrivateRoute requiredRole="admin" />}>*/}
                    <Route path="/dashboard" element={<Dashboard />} />
                {/*</Route>*/}
            </Routes>
        </BrowserRouter>
    );
}