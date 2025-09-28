import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./assets/css/fonts.css";
import "./assets/css/common.css";


const root = ReactDOM.createRoot(document.querySelector('body'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
