import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from '../src/pages/MainPage';
import SQLInjection from '../src/pages/SQLInjection';
import BrokenAuth from '../src/pages/BrokenAuth';
import UserInformation from './pages/UserInformation';

export function Router() {
    return (
        <BrowserRouter>
            <div>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/sql-injection-test" element={<SQLInjection />} />
                    <Route path="/broken-auth-test" element={<BrokenAuth />} />
                    <Route path="/userInformation" element={<UserInformation />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

