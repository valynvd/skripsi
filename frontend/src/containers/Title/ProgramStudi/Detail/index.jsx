/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import DetailProgramStudi from './components/DetailProgramStudi';

const DetailProstudi = ({ match }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Detail Program Studi</h3>
      </Col>
    </Row>
    <Row>
      <DetailProgramStudi id={match.params.id} />
    </Row>
  </Container>
);

export default DetailProstudi;
