/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row, Alert,
} from 'reactstrap';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@mui/material/Modal';
import dataApi from '../../../../utils/dataApi';
import renderFileInputField from '../../../../shared/components/form/FileInput';

const CreateForm = ({ isOpen, handleClose }) => {
  const [judul, setJudul] = useState('');
  const [files, setFiles] = useState('');
  const [isError, setError] = useState(false);

  const handleSubmit = () => {
    const dataForm = new FormData();
    dataForm.append('judul', judul);
    dataForm.append('files', files);

    dataApi.postSuratPenugasan(dataForm).then((resp) => {
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
                    <h5 className="subhead">Surat Penugasan</h5>
                  </div>
                  <form className="form form--horizontal">
                    <div className="form__form-group">
                      <span className="form__form-group-label">Judul</span>
                      <div className="form__form-group-field">
                        <Field
                          name="judul"
                          component="input"
                          type="text"
                          placeholder="Tulis Judul"
                          onChange={(e) => {
                            setJudul(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Files</span>
                      <div className="form__form-group-field">
                        <Field
                          name="files"
                          component={renderFileInputField}
                          onChange={(e) => setFiles(e.file)}
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
