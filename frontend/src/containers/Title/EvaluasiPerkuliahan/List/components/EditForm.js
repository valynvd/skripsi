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
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@mui/material/Modal';
import renderSelectField from '../../../../../shared/components/form/Select';
import dataApi from '../../../../../utils/dataApi';

const EditForm = ({
  isOpen, handleClose, data, initialize,
}) => {
  const [Id, setId] = useState(null);
  const [sksRealisasi, setSKSRealisasi] = useState(null);
  const [tahun, setTahun] = useState(null);
  const [periode, setPeriode] = useState(null);
  const [suratPenugasan, setSuratPenugasan] = useState(null);
  const [dosenPengampu, setDosenPengampu] = useState(null);
  const [mataKuliah, setMataKuliah] = useState(null);
  // Variabel state for edit
  const [editId, setEditId] = useState(null);
  const [editSKSRealisasi, setEditSKSRealisasi] = useState(null);
  const [editTahun, setEditTahun] = useState(null);
  const [editPeriode, setEditPeriode] = useState(null);
  const [editSuratPenugasan, setEditSuratPenugasan] = useState(null);
  const [editDosenPengampu, setEditDosenPengampu] = useState(null);
  const [editMataKuliah, setEditMataKuliah] = useState(null);
  const [penugasanId, setpenugasanId] = useState([]);
  const [dosenId, setdosenId] = useState([]);
  const [matakuliahId, setmatakuliahId] = useState([]);

  const [isError, setError] = useState(false);

  function titleCase(str) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  }

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

    if (data) {
      const initData = {
        id: data.id,
        sks_realisasi: data.sks_realisasi,
        tahun: data.tahun,
        periode: { value: data.periode, label: titleCase(data.periode) },
        surat_penugasan: { value: data.surat_penugasan_detail.id, label: data.surat_penugasan_detail.judul },
        dosen_pengampu: { value: data.dosen_pengampu_detail.id, label: data.dosen_pengampu_detail.name },
        mata_kuliah: { value: data.mata_kuliah_detail.id, label: data.mata_kuliah_detail.name },
      };
      initialize(initData);
      setId(data.id);
      setSKSRealisasi(data.sks_realisasi);
      setTahun(data.tahun);
      setPeriode(data.periode);
      setSuratPenugasan(data.surat_penugasan);
      setDosenPengampu(data.dosen_pengampu);
      setMataKuliah(data.mata_kuliah);
      setEditId(data.id);
      setEditSKSRealisasi(data.sks_realisasi);
      setEditTahun(data.tahun);
      setEditPeriode(data.periode);
      setEditSuratPenugasan(data.surat_penugasan);
      setEditDosenPengampu(data.dosen_pengampu);
      setEditMataKuliah(data.mata_kuliah);
    }
  }, [data, initialize]);
  const handleSubmit = () => {
    const dataForm = new FormData();
    if (sksRealisasi !== editSKSRealisasi && editSKSRealisasi !== '') {
      dataForm.append('sks_realisasi', editSKSRealisasi);
    }
    if (tahun !== editTahun && editTahun !== '') {
      dataForm.append('tahun', editTahun);
    }
    if (periode !== editPeriode && editPeriode !== '') {
      dataForm.append('periode', editPeriode);
    }
    // eslint-disable-next-line camelcase
    if (suratPenugasan !== editSuratPenugasan && editSuratPenugasan !== '') {
      dataForm.append('surat_penugasan', editSuratPenugasan);
    }
    if (dosenPengampu !== editDosenPengampu && editDosenPengampu !== '') {
      dataForm.append('dosen_pengampu', editDosenPengampu);
    }
    if (mataKuliah !== editMataKuliah && mataKuliah !== '') {
      dataForm.append('mata_kuliah', editMataKuliah);
    }
    dataApi.editPenugasanPengajaran(data.id, dataForm).then((resp) => {
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
                    <h5 className="bold-text">Edit Data</h5>
                    <h5 className="subhead">{data && data.nama}</h5>
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
                      <span className="form__form-group-label">SKS Realisasi</span>
                      <div className="form__form-group-field">
                        <Field
                          name="sks_realisasi"
                          component="input"
                          type="text"
                          placeholder="Tulis Catatan"
                          onChange={(e) => {
                            setEditSKSRealisasi(e.target.value);
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
                          placeholder="Tulis SKS Realisasi"
                          onChange={(e) => {
                            setEditTahun(e.target.value);
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
                          onChange={(e) => setEditPeriode(e.value)}
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
                          onChange={(e) => setEditSuratPenugasan(e.value)}
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
                          onChange={(e) => setEditDosenPengampu(e.value)}
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
                          onChange={(e) => setEditMataKuliah(e.value)}
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
        </Modal>
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
