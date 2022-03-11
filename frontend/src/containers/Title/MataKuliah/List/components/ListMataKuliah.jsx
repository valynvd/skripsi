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
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Divider from '@mui/material/Divider';
import CreateForm from './CreateForm';
import EditForm from './EditForm';
import DeleteForm from './DeleteForm';
import dataApi from '../../../../../utils/dataApi';

const ListMataKuliah = () => {
  const [searchText, setSearchText] = useState('');
  const [post, setPost] = useState([]);
  const [mataKuliah, setMataKuliah] = useState([]);
  const [filteredMataKuliah, setFilteredMataKuliah] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [isFetching, setFetching] = useState(true);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [isDeleteFormOpen, setDeleteFormOpen] = useState(false);
  const [selectedDataEdit, setSelectedDataEdit] = useState(null);
  const [selectedDataDelete, setSelectedDataDelete] = useState(null);
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

  const handleEditForm = (a) => {
    setSelectedDataEdit(a);
    setEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setEditFormOpen(false);
  };

  const handleDeleteForm = (a) => {
    setSelectedDataDelete(a);
    setDeleteFormOpen(true);
  };

  const handleCloseDeleteForm = () => {
    setDeleteFormOpen(false);
  };

  const getData = async () => {
    try {
      const resp = await dataApi.getMataKuliah();
      return resp;
    } catch (error) {
      return [];
    }
  };
  useEffect(async () => {
    const matrix = await getData();
    setMataKuliah(matrix.data);
    setFilteredMataKuliah(matrix.data);
    setFetching(false);
  }, []);

  const printPenugasan = () => {
    const test = [];
    for (let i = 0; i < filteredMataKuliah.length; i++) {
      test.push(
        <>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                history.push(`/dashboard/matakuliah/${filteredMataKuliah[i].id}`);
              }}
              >
                <ListItemIcon>
                  <FolderOpenIcon className="icon" />
                </ListItemIcon>
                <ListItemText>
                  <p>[{filteredMataKuliah[i].kode}] {filteredMataKuliah[i].name}</p>
                </ListItemText>
              </ListItemButton>
              <Box className="row">
                <Button
                  onClick={() => handleEditForm(filteredMataKuliah[i])}
                  variant="transparent"
                  startIcon={<ModeEditIcon />}
                  className="icon"
                >
                  <h5 className="bold-text">Edit</h5>
                </Button>
                <Button
                  onClick={() => handleDeleteForm(filteredMataKuliah[i])}
                  variant="transparent"
                  startIcon={<DeleteIcon />}
                  className="icon"
                >
                  <h5 className="bold-text">Delete</h5>
                </Button>
              </Box>
            </ListItem>
          </List>
        </>,
      );
    }
    return test;
  };

  return (
    <Col md={12}>
      <EditForm data={selectedDataEdit} isOpen={isEditFormOpen} handleClose={handleCloseEditForm} />
      <DeleteForm data={selectedDataDelete} isOpen={isDeleteFormOpen} handleClose={handleCloseDeleteForm} />
      <Card>
        <CreateForm isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">Mata Kuliah</h5>
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
                    setFilteredMataKuliah(mataKuliah);
                  } else {
                    const filtered = mataKuliah.filter(
                      (el) => el.name.toLowerCase().includes(e.target.value.toLowerCase()),
                    );
                    setFilteredMataKuliah(filtered);
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
          {printPenugasan()}
        </CardBody>
      </Card>
    </Col>
  );
};

export default ListMataKuliah;
