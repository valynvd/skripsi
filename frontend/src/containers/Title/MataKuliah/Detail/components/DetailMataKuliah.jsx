/* eslint-disable react/prop-types */
/* eslint-disable no-plusplus */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import {
  Card, CardBody, Col, Spinner,
} from 'reactstrap';
import dataApi from '../../../../../utils/dataApi';

const DetailMataKuliah = ({ id }) => {
  const [mataKuliah, setMataKuliah] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [isFetching, setFetching] = useState(true);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [isDeleteFormOpen, setDeleteFormOpen] = useState(false);
  const history = useHistory();

  const onFetch = () => {
    setFetching(false);
  };

  const getData = async () => {
    try {
      const resp = await dataApi.getMataKuliahbyId(id);
      return resp;
    } catch (error) {
      return [];
    }
  };

  useEffect(async () => {
    const matrix = await getData();
    setMataKuliah(matrix.data);
    setFetching(false);
  }, []);

  const printMataKuliah = () => {
    const test = [];
    test.push(
      <>
        <div>
          <h5 className="bold-text">Kode</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{mataKuliah.kode}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Kurikulum</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{mataKuliah.kurikulum}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">SKS Total</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{mataKuliah.sks_total}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">SKS Praktikum</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{mataKuliah.sks_praktikum}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Is Elective</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{mataKuliah.is_elective === true ? 'True' : 'False'}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Semester</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{mataKuliah.semester}</p>
        </div>
      </>,
    );
    return test;
  };

  return (
    <Col md={12}>
      <Card>
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">{mataKuliah.name}</h5>
          </div>

          {printMataKuliah()}
        </CardBody>
      </Card>
    </Col>
  );
};

export default DetailMataKuliah;
