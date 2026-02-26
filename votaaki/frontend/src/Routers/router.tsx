import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../Pages/Public/Main/Main";
import PollVote from "../Pages/Public/PollVote/PollVote";
import Auth from "../Pages/Public/Auth/Auth";
import Dashboard from "../Pages/Admin/Dashboard/Dashboard";
import Users from "../Pages/Admin/Users/Users";
import AdminLayout from "../Components/AdminLayout/AdminLayout";
import Polls from "../Pages/Admin/Polls/Polls";
import OptionVote from "../Pages/Admin/OptionVote/OptionVote";
import Reports from "../Pages/Admin/Reports/Reports";
import Profile from "../Pages/Profile/Profile";
import History from "../Pages/Admin/History/History";
import ProtectedRoute from "../Components/ProtectedRoute/ProtectedRoute";
import NotFound from "../Pages/NotFound/NotFound";

export default function Routers() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Main />} />
                <Route path="/vote/:id" element={<PollVote />} />
                <Route path="/auth" element={<Auth />} />

                {/* Secure Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/profile" element={<Profile />} />
                        
                        {/* Admin Specific Routes */}
                        <Route element={<ProtectedRoute adminOnly />}>
                            <Route path="/admin/dashboard" element={<Dashboard />} />
                            <Route path="/admin/users" element={<Users />} />
                            <Route path="/admin/polls" element={<Polls />} />
                            <Route path="/admin/options" element={<OptionVote />} />
                            <Route path="/admin/reports" element={<Reports />} />
                            <Route path="/admin/history" element={<History />} />
                        </Route>
                    </Route>
                </Route>

                {/* Catch-all Route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
