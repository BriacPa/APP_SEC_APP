import React from 'react';
import AppRoutes from './routes/Routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/custom.scss'

function App() {
    return (
        <body className="vh-min-100 vw-min-100">
            <div className="App">
            <AppRoutes />
            </div>
        </body>
    );
}

const link = document.createElement('link');
link.rel = 'icon';
link.href = './assts/images/logo.ico';
document.head.appendChild(link);

export default App;
