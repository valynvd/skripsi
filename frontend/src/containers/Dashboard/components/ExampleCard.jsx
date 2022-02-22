import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';

const ExampleCard = () => (
  <Col md={12}>
    <Card>
      <CardBody>
        <div className="card__title">
          <h5 className="bold-text">Selamat Datang</h5>
        </div>
        <p>diwebsite ini ...</p>
      </CardBody>
    </Card>
  </Col>
);

export default ExampleCard;
