import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { useParams, useHistory } from 'react-router-dom';
import Screen from './components/Screen';

const Folder1 = () => {
  const params = useParams();
  // eslint-disable-next-line no-console
  console.log(params);
  const history = useHistory();
  const { data } = history.location.state;
  return (
    <Container className="dashboard">
      <Row>
        <Col md={12}>
          <h3 className="page-title">{`${data.kode} ${data.element}`}</h3>
        </Col>
      </Row>
      <Row>
        <Screen params={params} />
      </Row>
    </Container>
  );
};

export default Folder1;
