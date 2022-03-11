import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import ListSuratPenugasan from './components/ListSuratPenugasan';

const SuratPenugasan = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Surat Penugasan</h3>
      </Col>
    </Row>
    <Row>
      <ListSuratPenugasan />
    </Row>
  </Container>
);

export default SuratPenugasan;
