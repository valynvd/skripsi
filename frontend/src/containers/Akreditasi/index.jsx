import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import MatrixPenilaian from './components/MatrixPenilaian';

const Akreditasi = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Akreditasi</h3>
      </Col>
    </Row>
    <Row>
      <MatrixPenilaian />
    </Row>
  </Container>
);

export default Akreditasi;
