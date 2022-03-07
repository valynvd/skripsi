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
import { useParams } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import Modal from '@mui/material/Modal';
import dataApi from '../../../../../utils/dataApi';
import renderSelectField from '../../../../../shared/components/form/Select';
import renderFileInputField from '../../../../../shared/components/form/FileInput';

const CreateForm = ({ isOpen, handleClose }) => {
  const [rps, setRPS] = useState(null);
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [rubrik, setRubrik] = useState(null);
  const [notes, setNotes] = useState('');
  const [isError, setError] = useState(false);
  const { id } = useParams();

  const handleSubmit = () => {
    const dataForm = new FormData();
    dataForm.append('rps', rps);
    dataForm.append('evaluation_report', evaluationReport);
    dataForm.append('rubrik', rubrik);
    dataForm.append('notes', notes);
    dataForm.append('penugasan', id);

    dataApi.postEvaluasiPerkuliahan(dataForm).then((resp) => {
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
                    <h5 className="subhead">Evaluasi Pengajaran</h5>
                  </div>
                  <form className="form form--horizontal">
                    <div className="form__form-group">
                      <span className="form__form-group-label">RPS</span>
                      <div className="form__form-group-field">
                        <Field
                          name="rps"
                          component={renderFileInputField}
                          onChange={(e) => setRPS(e.file)}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Evaluation Report</span>
                      <div className="form__form-group-field">
                        <Field
                          name="evaluation_report"
                          component={renderFileInputField}
                          onChange={(e) => setEvaluationReport(e.file)}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Rubrik</span>
                      <div className="form__form-group-field">
                        <Field
                          name="rubrik"
                          component={renderFileInputField}
                          onChange={(e) => setRubrik(e.file)}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Notes</span>
                      <div className="form__form-group-field">
                        <Field
                          name="notes"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Catatan"
                          onChange={(e) => {
                            setNotes(e.target.value);
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
