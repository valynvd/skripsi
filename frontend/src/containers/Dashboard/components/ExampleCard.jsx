import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';

const ExampleCard = () => (
  <Col md={12}>
    <Card>
      <CardBody>
        <div className="card__title">
          <h5 className="bold-text">Selamat Datang</h5>
        </div>
        <p>diwebsite tata kelola dan akreditasi program studi</p>
      </CardBody>
    </Card>
  </Col>
);

export default ExampleCard;
