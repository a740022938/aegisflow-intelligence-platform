import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './theme/tokens.css';
import './theme/workspaceControls.css';
import './theme/legacy-bridge.css';
import './theme/inline-style-bridge.css';
import './components/Layout.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
