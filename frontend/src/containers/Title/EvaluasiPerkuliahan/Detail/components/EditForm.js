/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row, Alert,
} from 'reactstrap';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@mui/material/Modal';
import renderFileInputField from '../../../../../shared/components/form/FileInput';
import dataApi from '../../../../../utils/dataApi';

const EditForm = ({
  isOpen, handleClose, data, initialize,
}) => {
  const [rps, setRPS] = useState(null);
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [rubrik, setRubrik] = useState(null);
  const [notes, setNotes] = useState(null);
  // Variabel state for edit
  const [editRPS, setEditRPS] = useState(null);
  const [editEvaluationReport, setEditEvaluationReport] = useState(null);
  const [editRubrik, setEditRubrik] = useState(null);
  const [editNotes, setEditNotes] = useState(null);

  const [isError, setError] = useState(false);

  useEffect(() => {
    if (data) {
      const initData = {
        rps: data.rps,
        evaluation_report: data.evaluation_report,
        rubrik: data.rubrik,
        notes: data.notes,
      };
      initialize(initData);
      setRPS(data.rps);
      setEvaluationReport(data.evaluation_report);
      setRubrik(data.rubrik);
      setNotes(data.notes);
      setEditRPS(data.rps);
      setEditEvaluationReport(data.evaluation_report);
      setEditRubrik(data.rubrik);
      setEditNotes(data.notes);
    }
  }, [data, initialize]);
  const handleSubmit = () => {
    const dataForm = new FormData();
    if (rps !== editRPS && editRPS !== '') {
      dataForm.append('rps', editRPS);
    }
    if (evaluationReport !== editEvaluationReport && editEvaluationReport !== '') {
      dataForm.append('evaluation_report', editEvaluationReport);
    }
    if (rubrik !== editRubrik && editRubrik !== '') {
      dataForm.append('rubrik', editRubrik);
    }
    if (notes !== editNotes && editNotes !== '') {
      dataForm.append('notes', editNotes);
    }
    dataApi.editEvaluasiPerkuliahan(data.id, dataForm).then((resp) => {
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
                      <span className="form__form-group-label">
                        RPS
                      </span>
                      <div className="form__form-group-field">
                        <div>
                          <a
                            href={rps}
                            target="_blank"
                            rel="noreferrer"
                          > Download file
                          </a>
                          <Field
                            name="rps"
                            component={renderFileInputField}
                            onChange={(e) => setEditRPS(e.file)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">
                        Evaluation Report
                      </span>
                      <div className="form__form-group-field">
                        <div>
                          <a
                            href={evaluationReport}
                            target="_blank"
                            rel="noreferrer"
                          > Download file
                          </a>
                          <Field
                            name="evaluation_report"
                            component={renderFileInputField}
                            onChange={(e) => setEditEvaluationReport(e.file)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">
                        Rubrik
                      </span>
                      <div className="form__form-group-field">
                        <div>
                          <a
                            href={rubrik}
                            target="_blank"
                            rel="noreferrer"
                          > Download file
                          </a>
                          <Field
                            name="rubrik"
                            component={renderFileInputField}
                            onChange={(e) => setEditRubrik(e.file)}
                          />
                        </div>
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
                            setEditNotes(e.target.value);
                          }}
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
