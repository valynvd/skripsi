import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from '../Layout/index';
import MainWrapper from './MainWrapper';
import LogIn from '../LogIn/index';
import Akreditasi from '../Akreditasi/index';
import Folder from '../Folder/index';
import SubFolder from '../SubFolder/index';
import Dashboard from '../Dashboard/index';

const Pages = () => (
  <Switch>
    <Route path="/dashboard/subfolder/:id" component={SubFolder} />
    <Route path="/dashboard/folder/:id" component={Folder} />
    <Route path="/dashboard/akreditasi" component={Akreditasi} />
    <Route path="/dashboard" component={Dashboard} />
  </Switch>
);

const wrappedRoutes = () => (
  <div>
    <Layout />
    <div className="container__wrap">
      <Route path="/dashboard" component={Pages} />
    </div>
  </div>
);

const Router = () => (
  <MainWrapper>
    <main>
      <Switch>
        <Route exact path="/" component={LogIn} />
        <Route exact path="/log_in" component={LogIn} />
        <Route path="/" component={wrappedRoutes} />
      </Switch>
    </main>
  </MainWrapper>
);

export default Router;
