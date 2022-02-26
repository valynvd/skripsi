import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Col,
  Input,
  InputGroup,
  Spinner,
} from 'reactstrap';
import { getToken } from '../../../utils/helpers';

const MatrixPenilaian = () => {
  const [searchText, setSearchText] = useState('');
  const [isFetching, setFetching] = useState(false);

  useEffect(() => {
    setFetching(true);
    const token = getToken();
    // eslint-disable-next-line no-console
    console.log('token: ', token);
  }, []);

  const onFetch = () => {
    setFetching(false);
  };

  return (
    <Col md={12}>
      <Card>
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">Matrix Penilaian</h5>
            <h5 className="subhead">Data berdasarkan lampiran 6a BAN PT</h5>
          </div>
          <div className="mb-3">
            <InputGroup className="d-flex align-items-center">
              <Input
                value={searchText}
                placeholder="keywords"
                type="text"
                onChange={(e) => {
                  // eslint-disable-next-line no-console
                  console.log(e.target.value);
                  setSearchText(e.target.value);
                }}
              />
              <Button className="mb-0 ml-3" onClick={onFetch}>Fetch Data</Button>
            </InputGroup>
          </div>
          { isFetching && <Spinner className="table-fetch-spinner" /> }
          <p>Your content here</p>
        </CardBody>
      </Card>
    </Col>
  );
};

export default MatrixPenilaian;
