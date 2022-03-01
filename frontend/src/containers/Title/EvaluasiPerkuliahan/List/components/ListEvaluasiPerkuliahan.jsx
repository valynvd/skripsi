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
  Card, CardBody, Col, Button, Input, InputGroup,
} from 'reactstrap';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Divider from '@mui/material/Divider';
import CreateForm from './CreateForm';
import dataApi from '../../../../../utils/dataApi';

const ListEvaluasiPerkuliahan = () => {
  const [searchText, setSearchText] = useState('');
  const [post, setPost] = useState([]);
  const [penugasan, setPenugasan] = useState([]);
  const [filteredPenugasan, setFilteredPenugasan] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [isFetching, setFetching] = useState(true);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const history = useHistory();

  const onFetch = () => {
    setFetching(false);
  };

  const handleCreateForm = () => {
    setCreateFormOpen(true);
  };

  const handleCloseForm = () => {
    setCreateFormOpen(false);
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
          <ListItemButton onClick={() => {
            history.push(`/dashboard/evaluasi/${filteredPenugasan[i].id}`);
          }}
          >
            <ListItemIcon>
              <FolderOpenIcon className="icon" />
            </ListItemIcon>
            <ListItemText>
              <p>[{filteredPenugasan[i].surat_penugasan_detail.judul}] - {filteredPenugasan[i].dosen_pengampu_detail.inisial} - {filteredPenugasan[i].mata_kuliah_detail.name}</p>
            </ListItemText>
          </ListItemButton>
        </>,
      );
    }
    return test;
  };

  return (
    <Col md={12}>
      <Card>
        <CreateForm isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">Evaluasi</h5>
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

          <div className="pl-3 pb-1">
            <AddCircleOutlineIcon className="icon" onClick={handleCreateForm} />
          </div>
          <Divider />
          {printPenugasan()}
        </CardBody>
      </Card>
    </Col>
  );
};

export default ListEvaluasiPerkuliahan;
