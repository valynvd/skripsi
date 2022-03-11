import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import ListMataKuliah from './components/ListMataKuliah';

const MataKuliahList = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Mata Kuliah</h3>
      </Col>
    </Row>
    <Row>
      <ListMataKuliah />
    </Row>
  </Container>
);

export default MataKuliahList;
