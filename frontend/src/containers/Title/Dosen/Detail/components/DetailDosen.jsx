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
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import dataApi from '../../../../../utils/dataApi';

const DetailDosen = ({ id }) => {
  const [post, setPost] = useState([]);
  const [isFetching, setFetching] = useState(true);

  const getData = async () => {
    try {
      const resp = await dataApi.getDosenbyId(id);
      return resp;
    } catch (error) {
      return [];
    }
  };
  useEffect(async () => {
    const matrix = await getData();
    console.log(matrix.data);
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
          <h5 className="bold-text">Name</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{post.name}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Inisial</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{post.inisial}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">is Fulltime</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p>{post.is_fulltime ? 'Yes' : 'No'}</p>
        </div>
        <hr />
        <div>
          <h5 className="bold-text">User Detail</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          {post.user_detail !== null
            ? <><p><span className="bold-text">Email:</span> {post.user_detail.email}</p><p><span className="bold-text">Full Name:</span> {post.user_detail.fullname}</p><p><span className="bold-text">Jabatan:</span>: {post.user_detail.jabatan}</p><p><span className="bold-text">Phone:</span>: {post.user_detail.phone}</p><p><span className="bold-text">Role:</span>: {post.user_detail.role}</p></>
            : <p>None</p>}
        </div>
        <hr />
        <div>
          <h5 className="bold-text">Prodi Detail</h5>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <p><span className="bold-text">Name:</span> {post.prodi_detail.name}</p>
          <p><span className="bold-text">Kode:</span> {post.prodi_detail.kode}</p>
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
          {isFetching ? null : printPenugasan()}
          { isFetching && <Spinner className="spinner table-fetch-spinner" /> }
        </CardBody>
      </Card>
    </Col>
  );
};

export default DetailDosen;
