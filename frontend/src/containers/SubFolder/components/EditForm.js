import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row, Alert,
} from 'reactstrap';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@mui/material/Modal';
import renderFileInputField from '../../../shared/components/form/FileInput';
import renderSelectField from '../../../shared/components/form/Select';
import dataApi from '../../../utils/dataApi';

const EditForm = ({ isOpen, handleClose, data }) => {
  const [jenis, setJenis] = useState(null);
  const [nama, setNama] = useState(null);
  const [file, setFile] = useState(null);
  // Variabel state for edit
  const [editJenis, setEditJenis] = useState(null);
  const [editNama, setEditNama] = useState(null);
  const [editFile, setEditFile] = useState(null);

  const [isError, setError] = useState(false);

  useEffect(() => {
    // console.log('cintaa', data);
    if (data) {
      console.log(setJenis);
      console.log(setNama);
      console.log(setFile);
      console.log(setEditJenis);
      console.log(setEditNama);
      console.log(setEditFile);

      // setJenis(data.jenis);
      // setNama(data.nama);
      // setFile(data.files);
      // setEditJenis(data.jenis);
      // setEditNama(data.nama);
      // setEditFile(data.files);
    }
  }, [data]);
  const handleSubmit = () => {
    const dataForm = new FormData();
    if (jenis !== editJenis && editJenis !== '') {
      dataForm.append('jenis', jenis);
    }
    if (nama !== editNama && editNama !== '') {
      dataForm.append('nama', nama);
    }
    if (editFile) {
      dataForm.append('files', file);
    }
    dataApi.editFolderFile(dataForm).then((resp) => {
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
                    <h5 className="bold-text">Edit Data</h5>
                    <h5 className="subhead">lalala</h5>
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
                        <Field
                          name="file"
                          component={renderFileInputField}
                          onChange={(e) => setEditFile(e.file)}
                        />
                      </div>
                    </div>
                    )}
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
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.shape().isRequired,
};

export default reduxForm({
  form: 'editFolder_form', // a unique identifier for this form
})(EditForm);
