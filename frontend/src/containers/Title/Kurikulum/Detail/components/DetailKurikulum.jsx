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

const DetailPenugasanPengajaran = ({ id }) => {
  const [post, setPost] = useState([]);
  const [isFetching, setFetching] = useState(true);

  const getData = async () => {
    try {
      const resp = await dataApi.getKurikulumbyId(id);
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
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <a href={post.file_panduan_kurikulum} target="_blank" rel="noreferrer" className="custom-file-detail">
            <InsertDriveFileIcon className="icon" />
            <p>File Panduan Kurikulum</p>
          </a>
        </div>
        <hr />
        <div>
          { isFetching && <Spinner className="spinner table-fetch-spinner mt-2" /> }
          <a href={post.file_pendukung} target="_blank" rel="noreferrer" className="custom-file-detail">
            <InsertDriveFileIcon className="icon" />
            <p>File Pendukung</p>
          </a>
        </div>
        <hr />
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

export default DetailPenugasanPengajaran;
