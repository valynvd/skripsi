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

const DetailPenugasanPengajaran = ({ id }) => {
  const [post, setPost] = useState([]);
  const [isFetching, setFetching] = useState(true);

  const getData = async () => {
    try {
      const resp = await dataApi.getPenugasanPengajaranbyId(id);
      return resp;
    } catch (error) {
      return [];
    }
  };
  useEffect(async () => {
    const matrix = await getData();
    setPost(matrix.data);
    setFetching(false);
  }, []);

  const openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const printPenugasan = () => {
    const test = [];
    test.push(
      <>
        <div>
          <h5 className="bold-text">SKS Realisasi</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{post.sks_realisasi}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Tahun</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{post.tahun}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Periode</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{post.periode}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Surat Penugasan</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{post.surat_penugasan}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Dosen Pengampu</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{post.dosen_pengampu}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Mata Kuliah</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{post.mata_kuliah}</p>
        </div>
      </>,
    );
    return test;
  };

  return (
    <Col md={12}>
      <Card>
        <CardBody>
          {/* <div className="card__title">
            <h5 className="bold-text">Detail</h5>
          </div> */}
          {printPenugasan()}
          { isFetching && <Spinner className="spinner table-fetch-spinner" /> }
        </CardBody>
      </Card>
    </Col>
  );
};

export default DetailPenugasanPengajaran;
