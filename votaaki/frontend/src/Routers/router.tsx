import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function Routers() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="*" element="Not Found"></Route>
                    <Route path="/" index element="Poll Page"></Route>
                    <Route path="/poll" element="Poll Page"></Route>
                    <Route path="/auth" element="Auth Poll"></Route>
                    <Route path="/register" element="Register Poll"></Route>
                    <Route path="/vote" element="Vote Page"></Route>
                </Routes>
            </BrowserRouter>

        </>
    )
}