import React from 'react';
import { Container, Row } from 'reactstrap';
import { useParams } from 'react-router-dom';
import Screen from './components/Screen';

const SubFolder = () => {
  const params = useParams();
  return (
    <Container className="dashboard">
      <Row>
        <Screen params={params} />
      </Row>
    </Container>
  );
};

export default SubFolder;
