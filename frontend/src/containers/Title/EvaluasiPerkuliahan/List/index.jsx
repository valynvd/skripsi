import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import ListEvaluasiPerkuliahan from './components/ListEvaluasiPerkuliahan';

const ListEvaluasi = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Evaluasi Perkuliahan</h3>
      </Col>
    </Row>
    <Row>
      <ListEvaluasiPerkuliahan />
    </Row>
  </Container>
);

export default ListEvaluasi;
