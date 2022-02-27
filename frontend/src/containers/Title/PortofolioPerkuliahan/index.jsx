import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import PortofolioPerkuliahan from './components/PortofolioPerkuliahan';

const Portofolio = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Portofolio Perkuliahan</h3>
      </Col>
    </Row>
    <Row>
      <PortofolioPerkuliahan />
    </Row>
  </Container>
);

export default Portofolio;
