/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Col, Container, Row } from 'reactstrap';
import Kriteria from './components/Kriteria';

const Akreditasi = ({ match }) => {
  const [title, setTitle] = useState([]);

  useEffect(() => {
    axios.get(`https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/kriteria/${match.params.id}/`, { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        setTitle(response.data);
      });
  }, [match.params.id]);

  return (
    <Container className="dashboard">
      <Row>
        <Col md={12}>
          <h3 className="page-title">{title.nama}</h3>
        </Col>
      </Row>
      <Row>
        <Kriteria id={match.params.id} />
      </Row>
    </Container>
  );
};

export default Akreditasi;
