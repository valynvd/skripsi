/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Kriteria from './components/Kriteria';

const Akreditasi = ({ match }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Kriteria {match.params.id}</h3>
      </Col>
    </Row>
    <Row>
      <Kriteria id={match.params.id} />
    </Row>
  </Container>
);

export default Akreditasi;
