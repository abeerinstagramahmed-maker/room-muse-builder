import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { Room } from './components/studio/Room';
import Studio from './pages/Studio';
import { ROOM_TEMPLATES } from './lib/roomTemplates';
import { TEMPLATE_OPENINGS } from './components/studio/StartHub';
import { useStudioStore } from './stores/studioStore';
import './index.css';

const params = new URLSearchParams(window.location.search);
const template = ROOM_TEMPLATES.find((t) => t.id === params.get('template'));
if (template) useStudioStore.getState().startRoom({ ...template, openings: TEMPLATE_OPENINGS[template.id] });
const root = document.getElementById('root');
if (root) createRoot(root).render(template ? <div style={{ width: '100vw', height: '100vh' }}><Canvas shadows dpr={1} camera={{ position: [25, 27, 25], fov: 40 }}><color attach="background" args={['#f1f0ee']} /><ambientLight intensity={1.1} /><directionalLight position={[0, 20, 5]} intensity={2} /><Room cutaway /></Canvas></div> : <HelmetProvider><QueryClientProvider client={new QueryClient()}><BrowserRouter><CartProvider><Studio /></CartProvider></BrowserRouter></QueryClientProvider></HelmetProvider>);