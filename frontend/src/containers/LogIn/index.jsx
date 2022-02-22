import React from 'react';
import LogInForm from './components/LogInForm';

const LogIn = () => (
  <div className="account">
    <div className="account__wrapper">
      <div className="account__card">
        <div className="account__head">
          <h3 className="account__title">Unit
            <span className="account__logo"> Penjaminan Mutu
              <span className="account__logo-accent"> (UPM)</span>
            </span>
          </h3>
          <h4 className="account__subhead subhead">STEM Prasetiya Mulya</h4>
        </div>
        <LogInForm onSubmit />
      </div>
    </div>
  </div>
);

export default LogIn;
