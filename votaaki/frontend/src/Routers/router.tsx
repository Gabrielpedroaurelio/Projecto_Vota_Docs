import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../Pages/Public/Main/Main";
import PollVote from "../Pages/Public/PollVote/PollVote";
import Auth from "../Pages/Public/Auth/Auth";

export default function Routers() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/vote/:id" element={<PollVote />} />
                <Route path="/auth" element={<Auth/>}></Route>
            </Routes>
        </BrowserRouter>
    )
}