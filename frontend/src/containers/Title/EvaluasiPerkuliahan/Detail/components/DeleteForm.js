import React, { useState } from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row, Alert,
} from 'reactstrap';
import Box from '@mui/material/Box';
import { reduxForm } from 'redux-form';
import PropTypes from 'prop-types';
import Modal from '@mui/material/Modal';
import dataApi from '../../../../../utils/dataApi';

const DeleteForm = ({ isOpen, handleClose, data }) => {
  const [isError, setError] = useState(false);
  const handleSubmit = () => {
    dataApi.deleteEvaluasiPerkuliahan(data.id).then((resp) => {
      // eslint-disable-next-line no-console
      console.log(resp);
      window.location.assign('/dashboard/evaluasi/');
      handleClose();
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
                    Error Delete Data. Tanyakan Admin untuk peristiwa ini.
                  </Alert>
                  )}
                  <div className="card__title">
                    <h5 className="bold-text">Delete Data</h5>
                  </div>
                  <form className="form form--horizontal">
                    <p>Apakah Anda yakin ingin menghapus data?</p>
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

DeleteForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.shape().isRequired,
};

export default reduxForm({
  form: 'deletefolder_form', // a unique identifier for this form
})(DeleteForm);
