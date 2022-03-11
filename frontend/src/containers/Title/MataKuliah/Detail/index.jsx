/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import DetailMataKuliah from './components/DetailMataKuliah';

const MataKuliahDetail = ({ match }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Detail Evaluasi Perkuliahan</h3>
      </Col>
    </Row>
    <Row>
      <DetailMataKuliah id={match.params.id} />
    </Row>
  </Container>
);

export default MataKuliahDetail;
