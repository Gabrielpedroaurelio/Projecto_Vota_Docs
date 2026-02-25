import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../Pages/Public/Main/Main";
import PollVote from "../Pages/Public/PollVote/PollVote";
import Auth from "../Pages/Public/Auth/Auth";
import Dashboard from "../Pages/Admin/Dashboard/Dashboard";
import Users from "../Pages/Admin/Users/Users";
import AdminLayout from "../Components/AdminLayout/AdminLayout";

export default function Routers() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Main />} />
                <Route path="/vote/:id" element={<PollVote />} />
                <Route path="/auth" element={<Auth />} />

                {/* Admin Routes - Sidebar Layout (Protection removed as requested) */}
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/polls" element={<div>Polls Management</div>} />
                    <Route path="/admin/options" element={<div>Options Management</div>} />
                    <Route path="/admin/reports" element={<div>Reports Management</div>} />
                    <Route path="/profile" element={<div>Profile User</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}