/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
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
  const [name, setName] = useState('');
  const [inisial, setInisial] = useState('');
  const [user, setUser] = useState([]);
  const [programStudi, setProgramStudi] = useState([]);
  const [filteredUser, setFilteredUser] = useState([]);
  const [filteredProstudi, setFilteredProstudi] = useState([]);
  const [fullTime, setFullTime] = useState(false);
  const [isError, setError] = useState(false);

  const handleSubmit = () => {
    const dataForm = new FormData();
    console.log(fullTime);
    dataForm.append('name', name);
    dataForm.append('inisial', inisial);
    dataForm.append('user', user);
    dataForm.append('prodi', programStudi);

    dataApi.postDosen(dataForm).then((resp) => {
      // eslint-disable-next-line no-console
      console.log(resp);
      // handleClose();
      // window.location.reload();
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      setError(true);
      setTimeout(() => setError(false), 3000);
    });
  };

  const getData = async (api) => {
    try {
      const resp = await api;
      return resp;
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    console.log(fullTime);
  }, [fullTime]);

  useEffect(async () => {
    const userData = await getData(dataApi.getDosen());
    const prodiData = await getData(dataApi.getProgramStudi());

    const filteredUserData = [{ value: null, label: '---' }];
    for (let i = 0; i < userData.data.length; i++) {
      if (userData.data[i].user_detail !== null) {
        filteredUserData.push((({ user, user_detail }) => ({ value: user, label: `${user_detail.email} / ${user_detail.fullname}` }))(userData.data[i]));
      }
    }

    const filteredProgramStudi = [{ value: null, label: '---' }];
    for (let i = 0; i < prodiData.data.length; i++) {
      filteredProgramStudi.push((({ id, kode, name }) => ({ value: id, label: `[${kode}] ${name}` }))(prodiData.data[i]));
    }

    setFilteredUser(filteredUserData);
    setFilteredProstudi(filteredProgramStudi);
    console.log(userData);
  }, []);

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
                    <h5 className="subhead">Dosen</h5>
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
                            setName(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Inisial</span>
                      <div className="form__form-group-field">
                        <Field
                          name="inisial"
                          component="input"
                          type="text"
                          placeholder="Tulis Inisial"
                          onChange={(e) => {
                            setInisial(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <div className="form__form-group-field">
                        <Field
                          name="is_fulltime"
                          component={renderCheckBoxField}
                          label="Is Fulltime"
                          onChange={() => console.log('something')}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">User</span>
                      <div className="form__form-group-field">
                        <Field
                          name="user"
                          component={renderSelectField}
                          options={filteredUser}
                          onChange={(e) => {
                            setUser(e.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Program Studi</span>
                      <div className="form__form-group-field">
                        <Field
                          name="prodi"
                          component={renderSelectField}
                          options={filteredProstudi}
                          onChange={(e) => {
                            setProgramStudi(e.value);
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
