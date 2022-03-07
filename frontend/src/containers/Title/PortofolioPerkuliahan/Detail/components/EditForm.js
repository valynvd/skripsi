/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row, Alert,
} from 'reactstrap';
import axios from 'axios';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import renderSelectField from '../../../../../shared/components/form/Select';
import dataApi from '../../../../../utils/dataApi';

const EditForm = ({
  isOpen, handleClose, data, initialize,
}) => {
  const [Id, setId] = useState(null);
  const [outcomes, setOutcomes] = useState(null);
  const [metode, setMetode] = useState(null);
  const [sistemPenilaian, setSistemPenilaian] = useState(null);
  const [statistik, setStatistik] = useState(null);
  const [analisisStatistik, setAnalisisStatistik] = useState(null);
  const [komentar, setKomentar] = useState(null);
  const [refleksi, setRefleksi] = useState(null);
  const [rekomendasiDosen, setRekomendasiDosen] = useState(null);
  const [rekomendasiUniv, setRekomendasiUniv] = useState(null);
  const [Penugasan, setPenugasan] = useState(null);
  // Variabel state for edit
  const [editId, setEditId] = useState(null);
  const [editOutcomes, setEditOutcomes] = useState(null);
  const [editMetode, setEditMetode] = useState(null);
  const [editSistemPenilaian, setEditSistemPenilaian] = useState(null);
  const [editStatistik, setEditStatistik] = useState(null);
  const [editAnalisisStatistik, setEditAnalisisStatistik] = useState(null);
  const [editKomentar, setEditKomentar] = useState(null);
  const [editRefleksi, setEditRefleksi] = useState(null);
  const [editRekomendasiDosen, setEditRekomendasiDosen] = useState(null);
  const [editRekomendasiUniv, setEditRekomendasiUniv] = useState(null);
  const [editPenugasan, setEditPenugasan] = useState(null);
  // Others
  const [penugasanId, setpenugasanId] = useState([]);

  const [isError, setError] = useState(false);

  useEffect(() => {
    axios.get('https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/penugasanpengajaran/', { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        const testing = response.data;
        const Data = [{ value: null, label: '---' }];
        for (let i = 0; i < testing.length; i++) {
          Data.push((({ id, mata_kuliah_detail }) => ({ value: id, label: mata_kuliah_detail.name }))(testing[i]));
        }
        setpenugasanId(Data);
      });

    if (data) {
      const initData = {
        id: data.id,
        outcomes_mata_kuliah: data.outcomes_mata_kuliah,
        metode_mata_kuliah: data.metode_mata_kuliah,
        sistem_penilaian: data.sistem_penilaian,
        statistik_kelas: data.statistik_kelas,
        analisis_statistik_ketercapaian: data.analisis_statistik_ketercapaian,
        komentar_questioner: data.komentar_questioner,
        refleksi_pelaksanaan: data.refleksi_pelaksanaan,
        rekomendasi_perbaikan_dosen: data.rekomendasi_perbaikan_dosen,
        rekomendasi_perbaikan_univ: data.rekomendasi_perbaikan_univ,
        penugasan: data.penugasan,
      };
      initialize(initData);
      setId(data.id);
      setOutcomes(data.outcomes_mata_kuliah);
      setMetode(data.metode_mata_kuliah);
      setSistemPenilaian(data.sistem_penilaian);
      setStatistik(data.statistik_kelas);
      setAnalisisStatistik(data.analisis_statistik_ketercapaian);
      setKomentar(data.komentar_questioner);
      setRefleksi(data.refleksi_pelaksanaan);
      setRekomendasiDosen(data.rekomendasi_perbaikan_dosen);
      setRekomendasiUniv(data.rekomendasi_perbaikan_univ);
      setPenugasan(data.penugasan);

      setEditId(data.id);
      setEditOutcomes(data.outcomes_mata_kuliah);
      setEditMetode(data.metode_mata_kuliah);
      setEditSistemPenilaian(data.sistem_penilaian);
      setEditStatistik(data.statistik_kelas);
      setEditAnalisisStatistik(data.analisis_statistik_ketercapaian);
      setEditKomentar(data.komentar_questioner);
      setEditRefleksi(data.refleksi_pelaksanaan);
      setEditRekomendasiDosen(data.rekomendasi_perbaikan_dosen);
      setEditRekomendasiUniv(data.rekomendasi_perbaikan_univ);
      setEditPenugasan(data.penugasan);
    }
  }, [data, initialize]);
  const handleSubmit = () => {
    const dataForm = new FormData();
    if (Id !== editId && editId !== '') {
      dataForm.append('id', editId);
    }
    if (outcomes !== editOutcomes && editOutcomes !== '') {
      dataForm.append('outcomes_mata_kuliah', editOutcomes);
    }
    if (metode !== editMetode && editMetode !== '') {
      dataForm.append('metode_mata_kuliah', editMetode);
    }
    if (sistemPenilaian !== editSistemPenilaian && editSistemPenilaian !== '') {
      dataForm.append('sistem_penilaian', editSistemPenilaian);
    }
    if (statistik !== editStatistik && editStatistik !== '') {
      dataForm.append('statistik_kelas', editStatistik);
    }
    if (analisisStatistik !== editAnalisisStatistik && editAnalisisStatistik !== '') {
      dataForm.append('analisis_statistik_ketercapaian', editAnalisisStatistik);
    }
    if (komentar !== editKomentar && editKomentar !== '') {
      dataForm.append('komentar_questioner', editKomentar);
    }
    if (refleksi !== editRefleksi && editRefleksi !== '') {
      dataForm.append('refleksi_pelaksanaan', editRefleksi);
    }
    if (rekomendasiDosen !== editRekomendasiDosen && editRekomendasiDosen !== '') {
      dataForm.append('rekomendasi_perbaikan_dosen', editRekomendasiDosen);
    }
    if (rekomendasiUniv !== editRekomendasiUniv && editRekomendasiUniv !== '') {
      dataForm.append('rekomendasi_perbaikan_univ', editRekomendasiUniv);
    }
    if (Penugasan !== editPenugasan && editPenugasan !== '') {
      dataForm.append('penugasan', editPenugasan);
    }
    dataApi.editPortofolioPerkuliahan(data.id, dataForm).then((resp) => {
      // eslint-disable-next-line no-console
      console.log('success edit', resp);
      handleClose();
      window.location.reload();
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log('error edit', err);
      setError(true);
      setTimeout(() => setError(false), 3000);
    });
  };

  return (
    <Container className="dashboard">
      <Row>
        <Dialog
          open={isOpen}
          onClose={handleClose}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
          scroll="paper"
        >
          <Box>
            <Col md={12} lg={12}>
              <Card>
                <CardBody>
                  {isError && (
                  <Alert color="danger">
                    Error Upload Data. Cek kembali data yang Anda isi.
                  </Alert>
                  )}
                  <div className="card__title">
                    <h5 className="bold-text">Edit Data</h5>
                  </div>
                  <form className="form form--horizontal">
                    <div className="form__form-group">
                      <span className="form__form-group-label">ID</span>
                      <div className="form__form-group-field">
                        <Field
                          name="id"
                          component="input"
                          type="number"
                          disabled
                          placeholder="Tulis ID"
                          onChange={(e) => {
                            setEditId(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Outcomes Mata Kuliah</span>
                      <div className="form__form-group-field">
                        <Field
                          name="outcomes_mata_kuliah"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Outcomes Mata Kuliah"
                          onChange={(e) => {
                            setEditOutcomes(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Metode Mata Kuliah</span>
                      <div className="form__form-group-field">
                        <Field
                          name="metode_mata_kuliah"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Metode Mata Kuliah"
                          onChange={(e) => {
                            setEditMetode(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Sistem Penilaian</span>
                      <div className="form__form-group-field">
                        <Field
                          name="sistem_penilaian"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Sistem Penilaian"
                          onChange={(e) => {
                            setEditSistemPenilaian(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Statistik Kelas</span>
                      <div className="form__form-group-field">
                        <Field
                          name="statistik_kelas"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Statistik Kelas"
                          onChange={(e) => {
                            setEditStatistik(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Analisis Statistik Ketercapaian</span>
                      <div className="form__form-group-field">
                        <Field
                          name="analisis_statistik_ketercapaian"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Analisis Statistik Ketercapaian"
                          onChange={(e) => {
                            setEditAnalisisStatistik(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Komentar Questioner</span>
                      <div className="form__form-group-field">
                        <Field
                          name="komentar_questioner"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Komentar Questioner"
                          onChange={(e) => {
                            setEditKomentar(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Refleksi Pelaksanaan</span>
                      <div className="form__form-group-field">
                        <Field
                          name="refleksi_pelaksanaan"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Refleksi Pelaksanaan"
                          onChange={(e) => {
                            setEditRefleksi(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Rekomendasi Perbaikan Dosen</span>
                      <div className="form__form-group-field">
                        <Field
                          name="rekomendasi_perbaikan_dosen"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Rekomendasi Perbaikan Dosen"
                          onChange={(e) => {
                            setEditRekomendasiDosen(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Rekomendasi Perbaikan Univ</span>
                      <div className="form__form-group-field">
                        <Field
                          name="rekomendasi_perbaikan_univ"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Rekomendasi Perbaikan Univ"
                          onChange={(e) => {
                            setEditRekomendasiUniv(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <ButtonToolbar className="form__button-toolbar">
                      <Button color="primary" onClick={handleSubmit}>Update</Button>
                      <Button type="button" onClick={handleClose}>
                        Cancel
                      </Button>
                    </ButtonToolbar>
                  </form>
                </CardBody>
              </Card>
            </Col>
          </Box>
        </Dialog>
      </Row>
    </Container>
  );
};

EditForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.shape().isRequired,
};

export default reduxForm({
  form: 'editFolder_form', // a unique identifier for this form
})(EditForm);
