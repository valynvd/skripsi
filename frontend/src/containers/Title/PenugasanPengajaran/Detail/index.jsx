/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import DetailPenugasanPengajaran from './components/DetailPenugasanPengajaran';

const DetailPenugasan = ({ match }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Detail Penugasan Pengajaran</h3>
      </Col>
    </Row>
    <Row>
      <DetailPenugasanPengajaran id={match.params.id} />
    </Row>
  </Container>
);

export default DetailPenugasan;
