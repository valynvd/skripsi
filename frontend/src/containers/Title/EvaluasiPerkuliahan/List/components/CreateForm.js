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
import Modal from '@mui/material/Modal';
import dataApi from '../../../../../utils/dataApi';
import renderSelectField from '../../../../../shared/components/form/Select';

const CreateForm = ({ isOpen, handleClose }) => {
  const [sksRealisasi, setSKSRealisasi] = useState('');
  const [tahun, setTahun] = useState('');
  const [periode, setPeriode] = useState([]);
  const [suratPenugasan, setSuratPenugasan] = useState('');
  const [dosenPengampu, setDosenPengampu] = useState('');
  const [mataKuliah, setMataKuliah] = useState('');
  const [penugasanId, setpenugasanId] = useState([]);
  const [dosenId, setdosenId] = useState([]);
  const [matakuliahId, setmatakuliahId] = useState([]);
  const [isError, setError] = useState(false);

  useEffect(() => {
    axios.get('https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/suratpenugasan/', { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        const testing = response.data;
        const Data = [{ value: null, label: '---' }];
        for (let i = 0; i < testing.length; i++) {
          Data.push((({ id, judul }) => ({ value: id, label: judul }))(testing[i]));
        }
        setpenugasanId(Data);
      });

    axios.get('https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/dosen/', { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        const testing = response.data;
        const Data = [{ value: null, label: '---' }];
        for (let i = 0; i < testing.length; i++) {
          Data.push((({ id, name }) => ({ value: id, label: name }))(testing[i]));
        }
        setdosenId(Data);
      });

    axios.get('https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/matakuliah/', { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        const testing = response.data;
        const Data = [{ value: null, label: '---' }];
        for (let i = 0; i < testing.length; i++) {
          Data.push((({ id, name }) => ({ value: id, label: name }))(testing[i]));
        }
        setmatakuliahId(Data);
      });
  }, []);

  const handleSubmit = () => {
    const dataForm = new FormData();
    dataForm.append('sks_realisasi', sksRealisasi);
    dataForm.append('tahun', tahun);
    dataForm.append('periode', periode);
    dataForm.append('surat_penugasan', suratPenugasan);
    dataForm.append('dosen_pengampu', dosenPengampu);
    dataForm.append('mata_kuliah', mataKuliah);

    dataApi.postPenugasanPengajaran(dataForm).then((resp) => {
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

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Container className="dashboard">
      <Row>
        <Modal
          open={isOpen}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
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
                    <h5 className="subhead">Evaluasi Pengajaran</h5>
                  </div>
                  <form className="form form--horizontal">
                    <div className="form__form-group">
                      <span className="form__form-group-label">SKS Realisasi</span>
                      <div className="form__form-group-field">
                        <Field
                          name="sks_realisasi"
                          component="input"
                          type="text"
                          placeholder="Tulis SKS Realisasi"
                          onChange={(e) => {
                            setSKSRealisasi(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Tahun</span>
                      <div className="form__form-group-field">
                        <Field
                          name="tahun"
                          component="input"
                          type="text"
                          placeholder="Tulis Tahun"
                          onChange={(e) => {
                            setTahun(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Periode</span>
                      <div className="form__form-group-field">
                        <Field
                          name="periode"
                          component={renderSelectField}
                          options={[
                            { value: 'ganjil', label: 'Ganjil' },
                            { value: 'genap', label: 'Genap' },
                            { value: 'semester pendek', label: 'Semester Pendek' },
                          ]}
                          onChange={(e) => {
                            setPeriode(e.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Surat Penugasan</span>
                      <div className="form__form-group-field">
                        <Field
                          name="surat_penugasan"
                          component={renderSelectField}
                          options={penugasanId}
                          onChange={(e) => {
                            setSuratPenugasan(e.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Dosen Pengampu</span>
                      <div className="form__form-group-field">
                        <Field
                          name="dosen_pengampu"
                          component={renderSelectField}
                          options={dosenId}
                          onChange={(e) => {
                            setDosenPengampu(e.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Mata Kuliah</span>
                      <div className="form__form-group-field">
                        <Field
                          name="mata_kuliah"
                          component={renderSelectField}
                          options={matakuliahId}
                          onChange={(e) => {
                            setMataKuliah(e.value);
                          }}
                        />
                      </div>
                    </div>
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
        </Modal>
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
