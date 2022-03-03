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
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Divider from '@mui/material/Divider';
import CreateForm from './CreateForm';
import dataApi from '../../../../../utils/dataApi';

const SubPortofolioPerkuliahan = ({ id }) => {
  const [searchText, setSearchText] = useState('');
  const [post, setPost] = useState([]);
  const [portofolio, setPortofolio] = useState([]);
  const [filteredPortofolio, setFilteredPortofolio] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const [isFetching, setFetching] = useState(true);
  const history = useHistory();

  const onFetch = () => {
    setFetching(false);
  };

  const getData = async () => {
    try {
      const resp = await dataApi.getPortofolioPerkuliahan();
      return resp;
    } catch (error) {
      return [];
    }
  };

  useEffect(async () => {
    const matrix = await getData();
    setPortofolio(matrix.data);
    setFilteredPortofolio(matrix.data);
    setFetching(false);
  }, []);

  const handleCreateForm = () => {
    setCreateFormOpen(true);
  };

  const handleCloseForm = () => {
    setCreateFormOpen(false);
  };

  const printPortofolio = () => {
    const test = [];
    for (let i = 0; i < filteredPortofolio.length; i++) {
      const Id = parseInt(id, 10);
      if (filteredPortofolio[i].penugasan === Id) {
        test.push(
          <>
            <CreateForm isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  history.push(`/dashboard/portofolio/detail/${filteredPortofolio[i].id}`);
                }}
                >
                  <ListItemIcon>
                    <InsertDriveFileIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText>
                    <p>Portofolio {filteredPortofolio[i].id}</p>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            </List>
          </>,
        );
      }
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
                    setFilteredPortofolio(portofolio);
                  } else {
                    const filtered = portofolio.filter(
                      (el) => el.outcomes_mata_kuliah.toLowerCase().includes(e.target.value.toLowerCase()),
                    );
                    setFilteredPortofolio(filtered);
                  }
                }}
              />
              <Button className="mb-0 ml-3" onClick={onFetch}>Cari</Button>
            </InputGroup>
          </div>

          <div className="pl-3 pb-1">
            <AddCircleOutlineIcon className="icon" onClick={handleCreateForm} />
          </div>
          <Divider />
          { isFetching && <Spinner className="spinner table-fetch-spinner m-2" /> }
          {printPortofolio()}
        </CardBody>
      </Card>
    </Col>
  );
};

export default SubPortofolioPerkuliahan;
