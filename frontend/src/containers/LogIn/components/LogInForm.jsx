import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import { Button, Alert } from 'reactstrap';
import EyeIcon from 'mdi-react/EyeIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import authApi from '../../../utils/auth';

const LogInForm = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isError, setError] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const showPassword = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const handleLogin = async () => {
    const dataLogin = new FormData();
    dataLogin.append('email', username);
    dataLogin.append('password', password);
    try {
      const { data } = await authApi.postLogIn(dataLogin);
      // eslint-disable-next-line no-console
      console.log(data);
      history.push('/dashboard');
    } catch (error) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <>
      {isError && (
      <Alert color="danger">
        Username / Password salah
      </Alert>
      )}
      <form className="form" onSubmit={() => {}}>
        <div className="form__form-group">
          <span className="form__form-group-label">Username</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon />
            </div>
            <Field
              name="name"
              component="input"
              type="text"
              placeholder="Name"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">Password</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <KeyVariantIcon />
            </div>
            <Field
              name="password"
              component="input"
              type={isPasswordShown ? 'text' : 'password'}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className={`form__form-group-button${isPasswordShown ? ' active' : ''}`}
              onClick={() => showPassword()}
              type="button"
            ><EyeIcon />
            </button>
          </div>
          <div className="account__forgot-password">
            <a href="/">Forgot a password?</a>
          </div>
        </div>
        <Button
          onClick={handleLogin}
          className="btn btn-primary account__btn account__btn--small"
          to="/dashboard"
        >Sign In
        </Button>
      </form>
    </>
  );
};

LogInForm.propTypes = {
  // handleSubmit: PropTypes.func.isRequired,
};

export default reduxForm({
  form: 'log_in_form',
})(LogInForm);
