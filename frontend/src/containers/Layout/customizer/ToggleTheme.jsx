import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-switch';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { changeThemeToDark, changeThemeToLight } from '../../../redux/actions/themeActions';
import { ThemeProps } from '../../../shared/prop-types/ReducerProps';

const ToggleTheme = ({ theme, dispatch }) => {
  const [currentTheme, setcurrentTheme] = useState('theme-light');
  useEffect(() => {
    setcurrentTheme(theme.className);
  }, [theme]);
  return (
    <label className="toggle-box toggle-btn customizer__toggle" htmlFor="theme_toggle">
      <Switch
        height={21}
        width={49}
        checkedIcon={false}
        uncheckedIcon={false}
        onColor="#ccc"
        onChange={() => {
          if (currentTheme === 'theme-dark') {
            dispatch(changeThemeToLight());
          } else {
            dispatch(changeThemeToDark());
          }
        }}
        checked={currentTheme === 'theme-dark'}
      />
    </label>
  );
};

ToggleTheme.propTypes = {
  theme: ThemeProps.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default withRouter(connect((state) => ({
  theme: state.theme,
}))(ToggleTheme));
