import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StarterPage from './pages/starter';
import NoPage from './NoPage';
import IndexPage from './pages';

require('./App.css');

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <BrowserRouter>
                    <Routes>
                        <Route path="/">
                            <Route index element={<IndexPage />} />
                            <Route path="*" element={<NoPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </header>
        </div>
    );
}

export default App;
