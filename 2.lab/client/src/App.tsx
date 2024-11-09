import React, { useEffect, useState } from 'react';
import './App.css';
import { Router } from './Router';

function App() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  useEffect(() => {
    setScriptLoaded(true);
  })
  return (
    <div className='app_container'>
      {scriptLoaded && (
        <Router />
      )}
    </div>

  );
}

export default App;