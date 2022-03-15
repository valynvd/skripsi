import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import ListKurikulum from './components/ListKurikulum';

const ListKuri = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Kurikulum</h3>
      </Col>
    </Row>
    <Row>
      <ListKurikulum />
    </Row>
  </Container>
);

export default ListKuri;
