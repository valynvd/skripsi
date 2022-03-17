/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  Col,
  Input,
  InputGroup,
  Spinner,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Divider from '@mui/material/Divider';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import dataApi from '../../../utils/dataApi';
import CreateForm from './CreateForm';
import EditForm from './EditForm';
import DeleteForm from './DeleteForm';

const Kriteria = ({ id }) => {
  const [searchText, setSearchText] = useState('');
  const [kriteria, setKriteria] = useState([]);
  const [filteredKriteria, setFilteredKriteria] = useState([]);
  const [isFetching, setFetching] = useState(true);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [isDeleteFormOpen, setDeleteFormOpen] = useState(false);
  const [selectedDataEdit, setSelectedDataEdit] = useState(null);
  const [selectedDataDelete, setSelectedDataDelete] = useState(null);
  const history = useHistory();

  const getData = async () => {
    try {
      const resp = await dataApi.getFolderbyKriteria(id);
      return resp;
    } catch (error) {
      return [];
    }
  };

  useEffect(async () => {
    const matrix = await getData();
    setKriteria(matrix.data);
    setFilteredKriteria(matrix.data);
    setFetching(false);
  }, [id]);

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

  const printTitle = () => {
    const test = [];
    test.push(
      <div className="card__title">
        <h5 className="bold-text">{kriteria.length > 0 && kriteria[0].kriteria_detail.nama}</h5>
        {kriteria[0] === undefined ? <div /> : <h5 className="subhead">{kriteria[0].kriteria_detail.deskripsi}</h5>}
      </div>,
    );
    return test;
  };

  const folders = filteredKriteria.map((val) => (
    <ListItem key={val.id} disablePadding>
      <ListItemButton onClick={() => {
        history.push(`/dashboard/subfolder/${val.id}`, {
          data: val,
        });
      }}
      >
        <ListItemIcon>
          <FolderOpenIcon className="icon" />
        </ListItemIcon>
        <ListItemText>
          <p>{val.nama}</p>
        </ListItemText>
      </ListItemButton>
      <Box className="row">
        <Button
          onClick={() => handleEditForm(val)}
          variant="transparent"
          startIcon={<ModeEditIcon />}
          className="icon"
        >
          <h5 className="bold-text">Edit</h5>
        </Button>
        <Button
          onClick={() => handleDeleteForm(val)}
          variant="transparent"
          startIcon={<DeleteIcon />}
          className="icon"
        >
          <h5 className="bold-text">Delete</h5>
        </Button>
      </Box>
    </ListItem>
  ));

  return (
    <Col md={12}>
      <CreateForm data={id} isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
      <EditForm data={selectedDataEdit} isOpen={isEditFormOpen} handleClose={handleCloseEditForm} />
      <DeleteForm data={selectedDataDelete} isOpen={isDeleteFormOpen} handleClose={handleCloseDeleteForm} />
      <Card>
        <CardBody>
          {isFetching ? null : printTitle()}
          <div className="mb-3">
            <InputGroup className="d-flex align-items-center">
              <Input
                value={searchText}
                placeholder="keywords"
                type="text"
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (e.target.value === '') {
                    setFilteredKriteria(kriteria);
                  } else {
                    const filtered = kriteria.filter(
                      (el) => el.element.toLowerCase().includes(e.target.value.toLowerCase()),
                    );
                    setFilteredKriteria(filtered);
                  }
                }}
              />
              <Button className="mb-0 ml-3" onClick={onFetch}>Cari</Button>
            </InputGroup>
          </div>
          { isFetching && <Spinner className="spinner table-fetch-spinner" /> }
          <Box>
            <div className="pl-3 pb-1">
              <AddCircleOutlineIcon onClick={handleCreateForm} className="icon" />
            </div>
            <Divider />
            <nav aria-label="main mailbox folders">
              <List>
                {folders}
              </List>
            </nav>
          </Box>
        </CardBody>
      </Card>
    </Col>
  );
};

export default Kriteria;
