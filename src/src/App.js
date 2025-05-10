import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RouteMap from './components/Map/RouteMap.js';
import Login from './components/Auth/Login/Login.js';
import Register from './components/Auth/Register/Register.js';
import Auth from './components/Auth/Auth.js';
import Header from './components/Header/Header.js';
import Account from './components/Account/Account.js';
import RouteHistory from'./components/Map/RouteHistory.js';
import Stat from './components/Account/Stat.js';

import './App.css';


function AppLayout() {
  return (
    <>
      <Header />
      <ToastContainer />
      <Routes>
      <Route path="/Auth" element={<Auth/>} />
        <Route path="/" element={<RouteMap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/historiques" element={<RouteHistory />} />
        <Route path="/statistiques" element={<Stat />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;