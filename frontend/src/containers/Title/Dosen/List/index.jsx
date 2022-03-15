import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import ListDosen from './components/ListDosen';

const ListDos = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Dosen</h3>
      </Col>
    </Row>
    <Row>
      <ListDosen />
    </Row>
  </Container>
);

export default ListDos;
