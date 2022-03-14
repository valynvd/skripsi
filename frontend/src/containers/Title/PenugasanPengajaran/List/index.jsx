import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import ListPenugasanPengajaran from './components/ListPenugasanPengajaran';

const ListPenugasan = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Penugasan Pengajaran</h3>
      </Col>
    </Row>
    <Row>
      <ListPenugasanPengajaran />
    </Row>
  </Container>
);

export default ListPenugasan;
