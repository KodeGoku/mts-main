import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.tsx'
import '@blueprintjs/core/lib/css/blueprint.css'; // If using BlueprintJS

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
