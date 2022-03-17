/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Kriteria from './components/ListKriteria';

const ListKriteria = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">List Kriteria</h3>
      </Col>
    </Row>
    <Row>
      <Kriteria />
    </Row>
  </Container>
);

export default ListKriteria;
