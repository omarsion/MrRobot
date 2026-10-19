import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { startSvgOptimizer } from './services/svg-optimizer.client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Production is static: conversion, scheduling and persistence all run in the browser.
startSvgOptimizer();
