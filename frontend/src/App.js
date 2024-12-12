import React from 'react';
import AppRoutes from './routes/Routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/custom.scss'

function App() {
    return (
        <div className="App">
            <div className="bg-light vh-min-100">
            <AppRoutes />
            </div>
        </div>
    );
}

export default App;
