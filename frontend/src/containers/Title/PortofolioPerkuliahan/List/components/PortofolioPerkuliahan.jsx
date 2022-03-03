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
  Card, CardBody, Col, Input, InputGroup, Spinner,
} from 'reactstrap';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Divider from '@mui/material/Divider';
import dataApi from '../../../../../utils/dataApi';

const ListPortofolioPerkuliahan = () => {
  const [searchText, setSearchText] = useState('');
  const [post, setPost] = useState([]);
  const [penugasan, setPenugasan] = useState([]);
  const [filteredPenugasan, setFilteredPenugasan] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [isFetching, setFetching] = useState(true);
  const history = useHistory();

  const onFetch = () => {
    setFetching(false);
  };

  const getData = async () => {
    try {
      const resp = await dataApi.getPenugasanPengajaran();
      return resp;
    } catch (error) {
      return [];
    }
  };
  useEffect(async () => {
    const matrix = await getData();
    setPenugasan(matrix.data);
    setFilteredPenugasan(matrix.data);
    setFetching(false);
  }, []);

  const printPenugasan = () => {
    const test = [];
    for (let i = 0; i < filteredPenugasan.length; i++) {
      test.push(
        <>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                history.push(`/dashboard/portofolio/${filteredPenugasan[i].id}`);
              }}
              >
                <ListItemIcon>
                  <FolderOpenIcon className="icon" />
                </ListItemIcon>
                <ListItemText>
                  <p>{filteredPenugasan[i].mata_kuliah_detail.name}</p>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        </>,
      );
    }
    return test;
  };

  return (
    <Col md={12}>
      <Card>
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">Portofolio</h5>
          </div>

          <div className="mb-3">
            <InputGroup className="d-flex align-items-center">
              <Input
                value={searchText}
                placeholder="keywords"
                type="text"
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (e.target.value === '') {
                    setFilteredPenugasan(penugasan);
                  } else {
                    const filtered = penugasan.filter(
                      (el) => el.mata_kuliah_detail.name.toLowerCase().includes(e.target.value.toLowerCase()),
                    );
                    setFilteredPenugasan(filtered);
                  }
                }}
              />
              <Button className="mb-0 ml-3" onClick={onFetch}>Cari</Button>
            </InputGroup>
          </div>

          { isFetching && <Spinner className="spinner table-fetch-spinner m-2" /> }
          {printPenugasan()}
        </CardBody>
      </Card>
    </Col>
  );
};

export default ListPortofolioPerkuliahan;
