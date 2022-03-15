/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import DetailDosen from './components/DetailDosen';

const DetailDos = ({ match }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Detail Dosen</h3>
      </Col>
    </Row>
    <Row>
      <DetailDosen id={match.params.id} />
    </Row>
  </Container>
);

export default DetailDos;
