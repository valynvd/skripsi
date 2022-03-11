/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row, Alert,
} from 'reactstrap';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@mui/material/Modal';
import renderFileInputField from '../../../../shared/components/form/FileInput';
import dataApi from '../../../../utils/dataApi';

const EditForm = ({
  isOpen, handleClose, data, initialize,
}) => {
  const [Id, setId] = useState(null);
  const [judul, setJudul] = useState(null);
  const [files, setFiles] = useState(null);
  // Variabel state for edit
  const [editId, setEditId] = useState(null);
  const [editJudul, setEditJudul] = useState(null);
  const [editFiles, setEditFiles] = useState(null);

  const [isError, setError] = useState(false);

  function titleCase(str) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  }

  useEffect(() => {
    if (data) {
      console.log(data);
      const initData = {
        id: data.id,
        judul: data.judul,
        tahun: data.files,
      };
      initialize(initData);
      setId(data.id);
      setJudul(data.judul);
      setFiles(data.files);
      setEditId(data.id);
      setEditJudul(data.judul);
      setEditFiles(data.files);
    }
  }, [data, initialize]);
  const handleSubmit = () => {
    const dataForm = new FormData();
    if (judul !== editJudul && editJudul !== '') {
      dataForm.append('judul', editJudul);
    }
    if (files !== editFiles && editFiles !== '') {
      dataForm.append('files', editFiles);
    }
    dataApi.editSuratPenugasan(data.id, dataForm).then((resp) => {
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
                      <span className="form__form-group-label">Judul</span>
                      <div className="form__form-group-field">
                        <Field
                          name="judul"
                          component="input"
                          type="text"
                          placeholder="Tulis Judul"
                          onChange={(e) => {
                            setEditJudul(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">
                        Files
                      </span>
                      <div className="form__form-group-field">
                        <div>
                          <a
                            href={files}
                            target="_blank"
                            rel="noreferrer"
                          > Download file
                          </a>
                          <Field
                            name="files"
                            component={renderFileInputField}
                            onChange={(e) => setEditFiles(e.file)}
                          />
                        </div>
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
