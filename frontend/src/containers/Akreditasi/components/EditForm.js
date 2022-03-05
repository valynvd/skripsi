/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row, Alert,
} from 'reactstrap';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@mui/material/Modal';
import dataApi from '../../../utils/dataApi';

const EditForm = ({
  isOpen, handleClose, data, initialize,
}) => {
  const [kode, setKode] = useState(null);
  const [element, setElement] = useState(null);
  const [indikator, setIndikator] = useState(null);
  const [skorMaksimal, setSkorMaksimal] = useState(null);
  // Variabel state for edit
  const [editKode, setEditKode] = useState(null);
  const [editElement, setEditElement] = useState(null);
  const [editIndikator, setEditIndikator] = useState(null);
  const [editSkorMaksimal, setEditSkorMaksimal] = useState(null);

  const [isError, setError] = useState(false);

  useEffect(() => {
    if (data) {
      const initData = {
        kode: data.kode,
        element: data.element,
        indikator: data.indikator,
        skor_maksimal: data.skor_maksimal,
      };
      initialize(initData);
      setKode(data.kode);
      setElement(data.element);
      setIndikator(data.indikator);
      setSkorMaksimal(data.skor_maksimal);
      setEditKode(data.kode);
      setEditElement(data.element);
      setEditIndikator(data.indikator);
      setEditSkorMaksimal(data.skor_maksimal);
    }
  }, [data, initialize]);
  const handleSubmit = () => {
    const dataForm = new FormData();
    if (kode !== editKode && editKode !== '') {
      dataForm.append('kode', editKode);
    }
    if (element !== editElement && editElement !== '') {
      dataForm.append('element', editElement);
    }
    if (indikator !== editIndikator && editIndikator !== '') {
      dataForm.append('indikator', editIndikator);
    }
    if (skorMaksimal !== editSkorMaksimal && editSkorMaksimal !== '') {
      dataForm.append('skor_maksimal', editSkorMaksimal);
    }
    dataApi.editMatrixPenilaian(data.id, dataForm).then((resp) => {
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
                      <span className="form__form-group-label">Kode</span>
                      <div className="form__form-group-field">
                        <Field
                          name="kode"
                          component="input"
                          type="text"
                          placeholder="Tulis Kode"
                          onChange={(e) => {
                            setEditKode(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Element</span>
                      <div className="form__form-group-field">
                        <Field
                          name="element"
                          component="input"
                          type="text"
                          placeholder="Tulis Element"
                          onChange={(e) => {
                            setEditElement(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Indikator</span>
                      <div className="form__form-group-field">
                        <Field
                          name="indikator"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Indikator"
                          onChange={(e) => {
                            setEditIndikator(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Skor Maksimal</span>
                      <div className="form__form-group-field">
                        <Field
                          name="skor_maksimal"
                          component="textarea"
                          type="text"
                          placeholder="Tulis Skor Maksimal"
                          onChange={(e) => {
                            setEditSkorMaksimal(e.target.value);
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
