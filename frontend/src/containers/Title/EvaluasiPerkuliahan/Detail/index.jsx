/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import DetailEvaluasiPerkuliahan from './components/DetailEvaluasiPerkuliahan';

const DetailEvaluasi = ({ match }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Detail Evaluasi Perkuliahan</h3>
      </Col>
    </Row>
    <Row>
      <DetailEvaluasiPerkuliahan id={match.params.id} />
    </Row>
  </Container>
);

export default DetailEvaluasi;
