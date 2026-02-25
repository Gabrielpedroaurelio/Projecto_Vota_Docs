import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../Pages/Public/Main/Main";
import PollVote from "../Pages/Public/PollVote/PollVote";

export default function Routers() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/vote/:id" element={<PollVote />} />
            </Routes>
        </BrowserRouter>
    )
}