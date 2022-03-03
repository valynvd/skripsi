/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import SubPortofolioPerkuliahan from './components/SubPortofolioPerkuliahan';

const SubPortofolio = ({ match }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Portofolio Perkuliahan</h3>
      </Col>
    </Row>
    <Row>
      <SubPortofolioPerkuliahan id={match.params.id} />
    </Row>
  </Container>
);

export default SubPortofolio;
