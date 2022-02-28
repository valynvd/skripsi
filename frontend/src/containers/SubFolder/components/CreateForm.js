import React, { useState } from 'react';
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

const CreateForm = ({ isOpen, handleClose, data }) => {
  const [jenis, setJenis] = useState('Folder');
  const [nama, setNama] = useState('');
  const [file, setFile] = useState(null);
  const [isError, setError] = useState(false);
  const handleSubmit = () => {
    // eslint-disable-next-line no-console
    console.log('jenis', jenis);
    // eslint-disable-next-line no-console
    console.log('nama', nama);
    // eslint-disable-next-line no-console
    console.log('data.id', data.id);
    const dataForm = new FormData();
    dataForm.append('nama', nama);
    dataForm.append('jenis', jenis);
    dataForm.append('matrix', data.id);
    // eslint-disable-next-line no-console
    console.log(file);
    if (file) {
      dataForm.append('files', file);
    }
    dataApi.postFolderFile(dataForm).then((resp) => {
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
                    <h5 className="subhead">{data && data.nama}</h5>
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
