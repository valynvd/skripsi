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
import renderCheckBoxField from '../../../../../shared/components/form/CheckBox';
import dataApi from '../../../../../utils/dataApi';

const EditForm = ({
  isOpen, handleClose, data, initialize,
}) => {
  const [nama, setNama] = useState(null);
  const [kode, setKode] = useState(null);
  const [sksTotal, setSKSTotal] = useState(null);
  const [sksPraktikum, setSKSPraktikum] = useState(null);
  const [isElective, setIsElective] = useState(null);
  const [semester, setSemester] = useState(null);
  const [kurikulum, setKurikulum] = useState(null);
  // Variabel state for edit
  const [editNama, setEditNama] = useState(null);
  const [editKode, setEditKode] = useState(null);
  const [editSKSTotal, setEditSKSTotal] = useState(null);
  const [editSKSPraktikum, setEditSKSPraktikum] = useState(null);
  const [editIsElective, setEditIsElective] = useState(null);
  const [editSemester, setEditSemester] = useState(null);
  const [editKurikulum, setEditKurikulum] = useState(null);
  const [kurikulumId, setKurikulumId] = useState([]);

  const [isError, setError] = useState(false);

  function titleCase(str) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  }

  useEffect(() => {
    axios.get('https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/kurikulum/', { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        const testing = response.data;
        const Data = [{ value: null, label: '---' }];
        for (let i = 0; i < testing.length; i++) {
          Data.push((({ id, name }) => ({ value: id, label: name }))(testing[i]));
        }
        setKurikulumId(Data);
      });

    if (data) {
      console.log(data);
      const initData = {
        name: data.name,
        kode: data.kode,
        sks_total: data.sks_total,
        sks_praktikum: data.sks_praktikum,
        is_elective: data.is_elective,
        semester: { value: data.semester, label: data.semester },
        kurikulum: { value: data.kurikulum_detail.id, label: data.kurikulum_detail.name },
      };
      initialize(initData);
      setNama(data.name);
      setKode(data.kode);
      setSKSTotal(data.sks_total);
      setSKSPraktikum(data.sks_praktikum);
      setIsElective(data.is_elective);
      setSemester(data.semester);
      setKurikulum(data.kurikulum);
      setEditNama(data.name);
      setEditKode(data.kode);
      setEditSKSTotal(data.sks_total);
      setEditSKSPraktikum(data.sks_praktikum);
      setEditIsElective(data.is_elective);
      setEditSemester(data.semester);
      setEditKurikulum(data.kurikulum);
    }
  }, [data, initialize]);
  const handleSubmit = () => {
    const dataForm = new FormData();
    if (nama !== editNama && editNama !== '') {
      dataForm.append('name', editNama);
    }
    if (kode !== editKode && editKode !== '') {
      dataForm.append('kode', editKode);
    }
    if (sksTotal !== editSKSTotal && editSKSTotal !== '') {
      dataForm.append('sks_total', editSKSTotal);
    }
    // eslint-disable-next-line camelcase
    if (sksPraktikum !== editSKSPraktikum && sksPraktikum !== '') {
      dataForm.append('sks_praktikum', editSKSPraktikum);
    }
    if (isElective !== editIsElective && editIsElective !== '') {
      dataForm.append('is_elective', editIsElective);
    }
    if (semester !== editSemester && editSemester !== '') {
      dataForm.append('semester', editSemester);
    }
    if (kurikulum !== editKurikulum && editKurikulum !== '') {
      dataForm.append('kurikulum', editKurikulum);
    }
    dataApi.editMataKuliah(data.id, dataForm).then((resp) => {
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
                    <h5 className="subhead">{data && data.name}</h5>
                  </div>
                  <form className="form form--horizontal">
                    <div className="form__form-group">
                      <span className="form__form-group-label">Name</span>
                      <div className="form__form-group-field">
                        <Field
                          name="name"
                          component="input"
                          type="text"
                          placeholder="Tulis Nama"
                          onChange={(e) => {
                            setEditNama(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Kode</span>
                      <div className="form__form-group-field">
                        <Field
                          name="kode"
                          component="input"
                          type="text"
                          placeholder="Tulis Kode"
                          onChange={(e) => {
                            setEditKode(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">SKS Total</span>
                      <div className="form__form-group-field">
                        <Field
                          name="sks_total"
                          component="input"
                          type="text"
                          placeholder="Tulis SKS Total"
                          onChange={(e) => {
                            setEditSKSTotal(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">SKS Praktikum</span>
                      <div className="form__form-group-field">
                        <Field
                          name="sks_praktikum"
                          component="input"
                          type="text"
                          placeholder="Tulis SKS Praktikum"
                          onChange={(e) => {
                            setEditSKSPraktikum(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <div className="form__form-group-field">
                        <Field
                          name="is_elective"
                          component={renderCheckBoxField}
                          label="Is Elective"
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Semester</span>
                      <div className="form__form-group-field">
                        <Field
                          name="semester"
                          component={renderSelectField}
                          options={[
                            { value: '1', label: '1' },
                            { value: '2', label: '2' },
                            { value: '3', label: '3' },
                            { value: '4', label: '4' },
                            { value: '5', label: '5' },
                            { value: '6', label: '6' },
                            { value: '7', label: '7' },
                            { value: '8', label: '8' },
                          ]}
                          onChange={(e) => {
                            setEditSemester(e.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Kurikulum</span>
                      <div className="form__form-group-field">
                        <Field
                          name="kurikulum"
                          component={renderSelectField}
                          options={kurikulumId}
                          onChange={(e) => {
                            setEditKurikulum(e.value);
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
