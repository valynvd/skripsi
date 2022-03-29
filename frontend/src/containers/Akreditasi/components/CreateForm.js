/* eslint-disable no-console */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row, Alert,
} from 'reactstrap';
import axios from 'axios';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@mui/material/Modal';
import renderFileInputField from '../../../shared/components/form/FileInput';
import renderSelectField from '../../../shared/components/form/Select';
import dataApi from '../../../utils/dataApi';

const CreateForm = ({ isOpen, handleClose, data }) => {
  const [jenis, setJenis] = useState('Folder');
  const [nama, setNama] = useState('');
  const [file, setFile] = useState(null);
  const [dosen, setDosen] = useState(null);
  const [prodi, setProdi] = useState(null);
  const [dosenId, setDosenId] = useState([]);
  const [prodiId, setProdiId] = useState([]);
  const [isError, setError] = useState(false);

  useEffect(() => {
    axios.get('https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/dosen/', { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        const testing = response.data;
        const Data = [{ value: null, label: '---' }];
        for (let i = 0; i < testing.length; i++) {
          Data.push((({ id, name }) => ({ value: id, label: name }))(testing[i]));
        }
        setDosenId(Data);
      });

    axios.get('https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/programstudi/', { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        const testing = response.data;
        const Data = [{ value: null, label: '---' }];
        for (let i = 0; i < testing.length; i++) {
          Data.push((({ id, name }) => ({ value: id, label: name }))(testing[i]));
        }
        setProdiId(Data);
      });
  }, []);

  const handleSubmit = () => {
    const dataForm = new FormData();
    dataForm.append('nama', nama);
    dataForm.append('jenis', jenis);
    /* dataForm.append('matrix', null); */
    dataForm.append('kriteria', data);
    dataForm.append('dosen', dosen);
    dataForm.append('prodi', prodi);
    if (file) {
      dataForm.append('files', file);
    }
    /* dataForm.append('parent_folder', null); */
    dataApi.postKriteria(dataForm).then((resp) => {
      console.log(resp);
      handleClose();
      window.location.reload();
    }).catch((err) => {
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
                    {/* <h5 className="subhead">{`${data.kode} ${data.element}`}</h5> */}
                  </div>
                  <form className="form form--horizontal">
                    <div className="form__form-group">
                      <span className="form__form-group-label">Jenis</span>
                      <div className="form__form-group-field">
                        <Field
                          default="folder"
                          name="select"
                          component={renderSelectField}
                          options={[
                            { value: 'folder', label: 'Folder' },
                            { value: 'file', label: 'File' },
                          ]}
                          onChange={(e) => setJenis(e.value)}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Nama {jenis}</span>
                      <div className="form__form-group-field">
                        <Field
                          name="nama_folderfile"
                          component="input"
                          type="text"
                          placeholder={`Tulis nama ${jenis}`}
                          onChange={(e) => {
                            setNama(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    {jenis === 'file' && (
                    <div className="form__form-group">
                      <span className="form__form-group-label">
                        File Pendukung
                      </span>
                      <div className="form__form-group-field">
                        <Field
                          name="file"
                          component={renderFileInputField}
                          onChange={(e) => setFile(e.file)}
                        />
                      </div>
                    </div>
                    )}
                    <div className="form__form-group">
                      <span className="form__form-group-label">Dosen</span>
                      <div className="form__form-group-field">
                        <Field
                          name="dosen"
                          component={renderSelectField}
                          options={dosenId}
                          onChange={(e) => {
                            setDosen(e.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Prodi</span>
                      <div className="form__form-group-field">
                        <Field
                          name="prodi"
                          component={renderSelectField}
                          options={prodiId}
                          onChange={(e) => {
                            setProdi(e.value);
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
  data: PropTypes.shape().isRequired,
};

export default reduxForm({
  form: 'createfolder_form', // a unique identifier for this form
})(CreateForm);
