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
import renderCheckBoxField from '../../../../../shared/components/form/CheckBox';

const CreateForm = ({ isOpen, handleClose }) => {
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  const [sksTotal, setSKSTotal] = useState([]);
  const [sksPraktikum, setSKSPraktikum] = useState('');
  const [isElective, setIsElective] = useState('');
  const [semester, setSemester] = useState('');
  const [kurikulum, setKurikulum] = useState([]);
  const [kurikulumId, setKurikulumId] = useState([]);
  const [isError, setError] = useState(false);

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
  }, []);

  const handleSubmit = () => {
    const dataForm = new FormData();
    dataForm.append('name', nama);
    dataForm.append('kode', kode);
    dataForm.append('sks_total', sksTotal);
    dataForm.append('sks_praktikum', sksPraktikum);
    dataForm.append('is_elective', isElective);
    dataForm.append('semester', semester);
    dataForm.append('kurikulum', kurikulum);

    dataApi.postMataKuliah(dataForm).then((resp) => {
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
                    <h5 className="subhead">Mata Kuliah</h5>
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
                            setNama(e.target.value);
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
                            setKode(e.target.value);
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
                            setSKSTotal(e.target.value);
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
                            setSKSPraktikum(e.target.value);
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
                          name="periode"
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
                            setSemester(e.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Kurikulum</span>
                      <div className="form__form-group-field">
                        <Field
                          name="surat_penugasan"
                          component={renderSelectField}
                          options={kurikulumId}
                          onChange={(e) => {
                            setKurikulum(e.value);
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
