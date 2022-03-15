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
import renderFileInputField from '../../../../../shared/components/form/FileInput';
import renderSelectField from '../../../../../shared/components/form/Select';
import dataApi from '../../../../../utils/dataApi';

const EditForm = ({
  isOpen, handleClose, data, initialize,
}) => {
  const [Id, setId] = useState(null);
  const [name, setName] = useState('');
  const [panduanKurikulum, setPanduanKurikulum] = useState(null);
  const [pendukung, setPendukung] = useState(null);
  // Variabel state for edit
  const [editName, setEditName] = useState('');
  const [editPanduanKurikulum, setEditPanduanKurikulum] = useState(null);
  const [editPendukung, setEditPendukung] = useState(null);

  const [isError, setError] = useState(false);

  useEffect(() => {
    if (data) {
      const initData = {
        name: data.name,
      };
      initialize(initData);
      setId(data.id);
      setName(data.name);
      setPanduanKurikulum(data.file_panduan_kurikulum);
      setPendukung(data.file_pendukung);
      setEditName(data.name);
      setEditPanduanKurikulum(data.file_panduan_kurikulum);
      setEditPendukung(data.file_pendukung);
    }
  }, [data, initialize]);
  const handleSubmit = () => {
    const dataForm = new FormData();
    if (name !== editName && editName !== '') {
      dataForm.append('name', editName);
    }
    if (panduanKurikulum !== editPanduanKurikulum) {
      dataForm.append('file_panduan_kurikulum', editPanduanKurikulum);
    }
    if (pendukung !== editPendukung) {
      dataForm.append('file_pendukung', editPendukung);
    }
    dataApi.editKurikulum(data.id, dataForm).then((resp) => {
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
                      <span className="form__form-group-label">Name</span>
                      <div className="form__form-group-field">
                        <Field
                          name="name"
                          component="input"
                          type="text"
                          placeholder="Tulis Nama"
                          onChange={(e) => {
                            setEditName(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">File Panduan Kurikulum</span>
                      <div className="form__form-group-field">
                        <div>
                          <a
                            href={panduanKurikulum}
                            target="_blank"
                            rel="noreferrer"
                          > Download file
                          </a>
                          <Field
                            name="file_panduan_kurikulum"
                            component={renderFileInputField}
                            onChange={(e) => setEditPanduanKurikulum(e.file)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">File Pendukung</span>
                      <div className="form__form-group-field">
                        <div>
                          <a
                            href={pendukung}
                            target="_blank"
                            rel="noreferrer"
                          > Download file
                          </a>
                          <Field
                            name="file_pendukung"
                            component={renderFileInputField}
                            onChange={(e) => setEditPendukung(e.file)}
                          />
                        </div>
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

EditForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.shape().isRequired,
};

export default reduxForm({
  form: 'editFolder_form', // a unique identifier for this form
})(EditForm);
