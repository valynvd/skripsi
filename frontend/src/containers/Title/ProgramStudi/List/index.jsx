import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import ListProgramStudi from './components/ListProgramStudi';

const ListProstudi = () => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Program Studi</h3>
      </Col>
    </Row>
    <Row>
      <ListProgramStudi />
    </Row>
  </Container>
);

export default ListProstudi;
