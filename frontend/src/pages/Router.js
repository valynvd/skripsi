import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import Base from './Base';
import Home from './Home';
import Login from './login/Login';
import EvaluasiPerkuliahan from './evaluasi-perkuliahan/EvaluasiPerkuliahan';

const Router = () => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Base />}>
          <Route index element={<Home />} />
          <Route
            path="/evaluasi-perkuliahan"
            element={<EvaluasiPerkuliahan />}
          />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default Router;
