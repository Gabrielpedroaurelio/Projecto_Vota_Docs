import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "../Pages/Auth/Auth";
import Vote from '../Pages/Vote/Vote'
import Register from "../Pages/Register/Register";
import Poll from "../Pages/Poll/Poll";
import NotFound from "../Pages/NotFound/NotFound";

export default function Routers() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="*" element={<NotFound/>}></Route>
                    <Route path="/" index element={<Poll/>}></Route>
                    <Route path="/poll" element={<Poll/>}></Route>
                    <Route path="/auth" element={<Auth/>}></Route>
                    <Route path="/register" element={<Register/>}></Route>
                    <Route path="/vote" element={<Vote/>}></Route>
                </Routes>
            </BrowserRouter>

        </>
    )
}