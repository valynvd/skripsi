import React from 'react';
import {
  Card, CardBody, Col, Button, ButtonToolbar, Container, Row,
} from 'reactstrap';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@mui/material/Modal';
import renderFileInputField from '../../../shared/components/form/FileInput';

const CreateForm = ({ isOpen, handleClose, data }) => {
  const handleSubmit = () => {
    handleClose();
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
                  <div className="card__title">
                    <h5 className="bold-text">Create Data</h5>
                    <h5 className="subhead">{`${data.kode} ${data.element}`}</h5>
                  </div>
                  <form className="form form--horizontal" onSubmit={handleSubmit}>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Default Label</span>
                      <div className="form__form-group-field">
                        <Field
                          name="defaultInput"
                          component="input"
                          type="text"
                          placeholder="Default Input"
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Disabled Field</span>
                      <div className="form__form-group-field">
                        <Field
                          name="disableInput"
                          component="input"
                          type="text"
                          placeholder="Disabled Input"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">E-mail</span>
                      <div className="form__form-group-field">
                        <Field
                          name="email"
                          component="input"
                          type="email"
                          placeholder="example@mail.com"
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">Field with description</span>
                      <div className="form__form-group-field">
                        <Field
                          name="descriptionInput"
                          component="input"
                          type="text"
                        />
                      </div>
                      <span className="form__form-group-description">
                        Zealously now pronounce existence add you instantly say offending.
                      </span>
                    </div>
                    <div className="form__form-group">
                      <div className="form__form-group-field">
                        <Field
                          name="textarea"
                          component="textarea"
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">
                        Add file
                      </span>
                      <div className="form__form-group-field">
                        <Field
                          name="file"
                          component={renderFileInputField}
                        />
                      </div>
                    </div>
                    <ButtonToolbar className="form__button-toolbar">
                      <Button color="primary" type="submit">Submit</Button>
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
