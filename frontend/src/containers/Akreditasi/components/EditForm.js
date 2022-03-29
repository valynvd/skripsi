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
import renderFileInputField from '../../../shared/components/form/FileInput';
import renderSelectField from '../../../shared/components/form/Select';
import dataApi from '../../../utils/dataApi';

const EditForm = ({
  isOpen, handleClose, data, initialize,
}) => {
  const [jenis, setJenis] = useState(null);
  const [nama, setNama] = useState(null);
  const [file, setFile] = useState(null);
  const [dosen, setDosen] = useState(null);
  const [prodi, setProdi] = useState(null);
  const [dosenId, setDosenId] = useState(null);
  const [prodiId, setProdiId] = useState(null);
  // Variabel state for edit
  const [editJenis, setEditJenis] = useState(null);
  const [editNama, setEditNama] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editDosen, setEditDosen] = useState(null);
  const [editProdi, setEditProdi] = useState(null);

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

    if (data) {
      const initData = {
        jenis: data.jenis === 'folder'
          ? { value: 'folder', label: 'Folder' }
          : { value: 'file', label: 'File' },
        nama_folderfile: data.nama,
        file: data.files,
        dosen: { value: data.dosen_detail.id, label: data.dosen_detail.name },
        prodi: { value: data.prodi_detail.id, label: data.prodi_detail.name },
      };
      initialize(initData);
      setJenis(data.jenis);
      setNama(data.nama);
      setFile(data.files);
      setDosen(data.dosen);
      setProdi(data.prodi);
      setEditJenis(data.jenis);
      setEditNama(data.nama);
      setEditFile(data.files);
      setEditDosen(data.dosen);
      setEditProdi(data.prodi);
    }
  }, [data, initialize]);
  const handleSubmit = () => {
    const dataForm = new FormData();
    if (jenis !== editJenis && editJenis !== '') {
      dataForm.append('jenis', editJenis);
    }
    if (nama !== editNama && editNama !== '') {
      dataForm.append('nama', editNama);
    }
    if (file !== editFile) {
      dataForm.append('files', editFile);
    }
    if (dosen !== editDosen && editDosen !== '') {
      dataForm.append('dosen', editDosen);
    }
    if (prodi !== editProdi && editProdi !== '') {
      dataForm.append('prodi', editProdi);
    }
    dataApi.editKriteria(data.id, dataForm).then((resp) => {
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
                      <span className="form__form-group-label">Jenis</span>
                      <div className="form__form-group-field">
                        <Field
                          name="jenis"
                          component={renderSelectField}
                          options={[
                            { value: 'folder', label: 'Folder' },
                            { value: 'file', label: 'File' },
                          ]}
                          onChange={(e) => setEditJenis(e.value)}
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
                            setEditNama(e.target.value);
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
                        <div>
                          <a
                            href={file}
                            target="_blank"
                            rel="noreferrer"
                          > Download file
                          </a>
                          <Field
                            name="file"
                            component={renderFileInputField}
                            onChange={(e) => setEditFile(e.file)}
                          />
                        </div>
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
                          onChange={(e) => setEditDosen(e.value)}
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
                          onChange={(e) => setEditProdi(e.value)}
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
