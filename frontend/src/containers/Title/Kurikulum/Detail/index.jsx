/* eslint-disable react/prop-types */
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import DetailKurikulum from './components/DetailKurikulum';

const DetailKuri = ({ match }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Detail Kurikulum</h3>
      </Col>
    </Row>
    <Row>
      <DetailKurikulum id={match.params.id} />
    </Row>
  </Container>
);

export default DetailKuri;
