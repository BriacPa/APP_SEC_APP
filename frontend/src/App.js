import React from 'react';
import AppRoutes from './routes/Routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/custom.scss'

function App() {
    return (
        <div className="vh-min-100 vw-min-100">
            <div className="App">
            <AppRoutes />
            </div>
        </div>
    );
}

export default App;
