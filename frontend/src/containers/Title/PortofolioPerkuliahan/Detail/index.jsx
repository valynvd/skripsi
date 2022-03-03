/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import DetailPortofolioPerkuliahan from './components/DetailPortofolioPerkuliahan';

const DetailPortofolio = ({ match }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Portofolio Perkuliahan</h3>
      </Col>
    </Row>
    <Row>
      <DetailPortofolioPerkuliahan id={match.params.id} />
    </Row>
  </Container>
);

export default DetailPortofolio;
