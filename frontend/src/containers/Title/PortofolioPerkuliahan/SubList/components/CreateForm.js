/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row, Alert,
} from 'reactstrap';
import axios from 'axios';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Dialog from '@mui/material/Dialog';
import dataApi from '../../../../../utils/dataApi';
import renderSelectField from '../../../../../shared/components/form/Select';

const CreateForm = ({ isOpen, handleClose, data }) => {
  const [outcomes, setOutcomes] = useState(null);
  const [metode, setMetode] = useState(null);
  const [sistemPenilaian, setSistemPenilaian] = useState(null);
  const [statistik, setStatistik] = useState(null);
  const [analisisStatistik, setAnalisisStatistik] = useState(null);
  const [komentar, setKomentar] = useState(null);
  const [refleksi, setRefleksi] = useState(null);
  const [rekomendasiDosen, setRekomendasiDosen] = useState(null);
  const [rekomendasiUniv, setRekomendasiUniv] = useState(null);
  const [penugasan, setPenugasan] = useState(null);
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
  }, []);

  const handleSubmit = () => {
    const dataForm = new FormData();
    dataForm.append('outcomes_mata_kuliah', outcomes);
    dataForm.append('metode_mata_kuliah', metode);
    dataForm.append('sistem_penilaian', sistemPenilaian);
    dataForm.append('statistik_kelas', statistik);
    dataForm.append('analisis_statistik_ketercapaian', analisisStatistik);
    dataForm.append('komentar_questioner', komentar);
    dataForm.append('refleksi_pelaksanaan', refleksi);
    dataForm.append('rekomendasi_perbaikan_dosen', rekomendasiDosen);
    dataForm.append('rekomendasi_perbaikan_univ', rekomendasiUniv);
    dataForm.append('penugasan', data);

    dataApi.postPortofolioPerkuliahan(dataForm).then((resp) => {
      // eslint-disable-next-line no-console
      console.log(resp);
      handleClose();
      window.location.reload();
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
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
                    <h5 className="bold-text">Create Data</h5>
                    <h5 className="subhead">Portofolio Perkuliahan</h5>
                  </div>
                  <form className="form form--horizontal">
                    <div className="form__form-group">
                      <span className="form__form-group-label">Outcomes Mata Kuliah</span>
                      <div className="form__form-group-field">
                        <Field
                          name="outcomes_mata_kuliah"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Outcomes Mata Kuliah"
                          onChange={(e) => {
                            setOutcomes(e.target.value);
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
                            setMetode(e.target.value);
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
                            setSistemPenilaian(e.target.value);
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
                            setStatistik(e.target.value);
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
                            setAnalisisStatistik(e.target.value);
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
                            setKomentar(e.target.value);
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
                            setRefleksi(e.target.value);
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
                            setRekomendasiDosen(e.target.value);
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
                            setRekomendasiUniv(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    {/* <div className="form__form-group">
                      <span className="form__form-group-label">Penugasan</span>
                      <div className="form__form-group-field">
                        <Field
                          name="penugasan"
                          component={renderSelectField}
                          options={penugasanId}
                          onChange={(e) => {
                            setPenugasan(e.value);
                          }}
                        />
                      </div>
                    </div> */}
                    <ButtonToolbar className="form__button-toolbar">
                      <Button color="primary" onClick={handleSubmit}>Submit</Button>
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

CreateForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default reduxForm({
  form: 'createfolder_form', // a unique identifier for this form
})(CreateForm);
