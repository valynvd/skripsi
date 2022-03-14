import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from '../Layout/index';
import MainWrapper from './MainWrapper';
import LogIn from '../LogIn/index';
import Akreditasi from '../Akreditasi/index';
import Folder from '../Folder/index';
import SubFolder from '../SubFolder/index';
import Dashboard from '../Dashboard/index';
import ListEvaluasi from '../Title/EvaluasiPerkuliahan/List/index';
import DetailEvaluasi from '../Title/EvaluasiPerkuliahan/Detail/index';
import Portofolio from '../Title/PortofolioPerkuliahan/List/index';
import SubPortofolio from '../Title/PortofolioPerkuliahan/SubList/index';
import DetailPortofolio from '../Title/PortofolioPerkuliahan/Detail/index';
import SuratPenugasan from '../Title/SuratPenugasan/index';
import ListPenugasan from '../Title/PenugasanPengajaran/List/index';
import DetailPenugasan from '../Title/PenugasanPengajaran/Detail/index';
import MataKuliahList from '../Title/MataKuliah/List/index';
import MataKuliahDetail from '../Title/MataKuliah/Detail/index';

const Pages = () => (
  <Switch>
    <Route path="/dashboard/subfolder/:id" component={SubFolder} />
    <Route path="/dashboard/folder/:id" component={Folder} />
    <Route path="/dashboard/matakuliah/:id" exact component={MataKuliahDetail} />
    <Route path="/dashboard/evaluasi/:id" exact component={DetailEvaluasi} />
    <Route path="/dashboard/portofolio/:id" exact component={SubPortofolio} />
    <Route path="/dashboard/portofolio/detail/:id" exact component={DetailPortofolio} />
    <Route path="/dashboard/penugasan/:id" exact component={DetailPenugasan} />
    <Route path="/dashboard/akreditasi" component={Akreditasi} />
    <Route path="/dashboard/evaluasi" exact component={ListEvaluasi} />
    <Route path="/dashboard/portofolio" exact component={Portofolio} />
    <Route path="/dashboard/suratpenugasan" exact component={SuratPenugasan} />
    <Route path="/dashboard/penugasan" exact component={ListPenugasan} />
    <Route path="/dashboard/matakuliah" exact component={MataKuliahList} />
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
