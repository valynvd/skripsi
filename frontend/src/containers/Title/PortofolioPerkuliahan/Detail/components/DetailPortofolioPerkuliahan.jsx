/* eslint-disable react/prop-types */
/* eslint-disable no-plusplus */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import {
  Card, CardBody, Col, Input, InputGroup,
} from 'reactstrap';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Divider from '@mui/material/Divider';
import EditForm from './EditForm';
import DeleteForm from './DeleteForm';
import dataApi from '../../../../../utils/dataApi';

const DetailPortofolioPerkuliahan = ({ id }) => {
  const [penugasan, setPenugasan] = useState([]);
  const [portofolio, setPortofolio] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [isFetching, setFetching] = useState(true);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [isDeleteFormOpen, setDeleteFormOpen] = useState(false);
  const history = useHistory();

  const onFetch = () => {
    setFetching(false);
  };

  const getData = async () => {
    try {
      const resp = await dataApi.getPortofolioPerkuliahanbyId(id);
      return resp;
    } catch (error) {
      return [];
    }
  };

  const getData2 = async () => {
    try {
      const resp = await dataApi.getPenugasanPengajaran();
      return resp;
    } catch (error) {
      return [];
    }
  };

  useEffect(async () => {
    const matrix = await getData();
    const matrix2 = await getData2();
    setPortofolio(matrix.data);
    setPenugasan(matrix2.data);
    setFetching(false);
  }, []);

  const handleEditForm = () => {
    setEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setEditFormOpen(false);
  };

  const handleDeleteForm = () => {
    setDeleteFormOpen(true);
  };

  const handleCloseDeleteForm = () => {
    setDeleteFormOpen(false);
  };

  const printJudul = () => {
    const test = [];
    for (let i = 0; i < penugasan.length; i++) {
      if (penugasan[i].id === portofolio.penugasan) {
        test.push(
          <h5 className="bold-text">Portofolio {portofolio.id} - {penugasan[i].mata_kuliah_detail.name}</h5>,
        );
      }
    }
    return test;
  };

  const printPortofolio = () => {
    const test = [];
    test.push(
      <>
        <EditForm data={portofolio} isOpen={isEditFormOpen} handleClose={handleCloseEditForm} />
        <DeleteForm data={portofolio} isOpen={isDeleteFormOpen} handleClose={handleCloseDeleteForm} />

        <div className="row pl-3">
          <ModeEditIcon className="icon mr-2" onClick={() => handleEditForm()} />
          <DeleteIcon className="icon ml-2" onClick={() => handleDeleteForm()} />
        </div>

        <hr />

        <div>
          <h5 className="bold-text">Outcomes Mata Kuliah</h5>
          <p>{portofolio.outcomes_mata_kuliah}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Metode Mata Kuliah</h5>
          <p>{portofolio.metode_mata_kuliah}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Sistem Penilaian</h5>
          <p>{portofolio.sistem_penilaian}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Statistik Kelas</h5>
          <p>{portofolio.statistik_kelas}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Analisis Statistik Ketercapaian</h5>
          <p>{portofolio.analisis_statistik_ketercapaian}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Komentar Questioner</h5>
          <p>{portofolio.komentar_questioner}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Refleksi Pelaksanaan</h5>
          <p>{portofolio.refleksi_pelaksanaan}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Rekomendasi Perbaikan Dosen</h5>
          <p>{portofolio.rekomendasi_perbaikan_dosen}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Rekomendasi Perbaikan Univ</h5>
          <p>{portofolio.rekomendasi_perbaikan_univ}</p>
        </div>
      </>,
    );
    return test;
  };

  return (
    <Col md={12}>
      <Card>
        <CardBody>
          <div className="card__title">
            {printJudul()}
          </div>

          {printPortofolio()}
        </CardBody>
      </Card>
    </Col>
  );
};

export default DetailPortofolioPerkuliahan;
