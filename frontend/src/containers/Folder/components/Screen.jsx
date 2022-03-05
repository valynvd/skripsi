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
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Divider from '@mui/material/Divider';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import dataApi from '../../../utils/dataApi';
import CreateForm from './CreateForm';
import EditForm from './EditForm';
import DeleteForm from './DeleteForm';

const Screen = ({ params, data }) => {
  const [searchText, setSearchText] = useState('');
  const [folderFile, setfolderFile] = useState([]);
  const [isFetching, setFetching] = useState(true);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [isDeleteFormOpen, setDeleteFormOpen] = useState(false);
  const [selectedDataEdit, setSelectedDataEdit] = useState(null);
  const [selectedDataDelete, setSelectedDataDelete] = useState(null);
  const [filteredMatrixPenilaian, setFilteredMatrixPenilaian] = useState([]);
  const history = useHistory();

  const getData = async () => {
    try {
      const resp = await dataApi.getFolderbyMatrix(params.id);
      return resp;
    } catch (error) {
      return [];
    }
  };
  useEffect(async () => {
    const matrix = await getData();
    setfolderFile(matrix.data);
    setFilteredMatrixPenilaian(matrix.data);
    setFetching(false);
  }, []);

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

  const folders = filteredMatrixPenilaian.map((val) => (
    <ListItem key={val.id} disablePadding>
      {val.jenis === 'folder' ? (
        <>
          <ListItemButton onClick={() => {
            history.push(`/dashboard/subfolder/${val.id}`);
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
        </>
      ) : (
        <>
          <ListItemButton onClick={() => { window.open(val.files); }}>
            <ListItemIcon>
              <FilePresentIcon className="icon" />
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
        </>
      )}
    </ListItem>
  ));

  return (
    <Col md={12}>
      <CreateForm data={data} isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
      <EditForm data={selectedDataEdit} isOpen={isEditFormOpen} handleClose={handleCloseEditForm} />
      <DeleteForm data={selectedDataDelete} isOpen={isDeleteFormOpen} handleClose={handleCloseDeleteForm} />
      <Card>
        <CardBody>
          <div className="mb-3">
            <InputGroup className="d-flex align-items-center">
              <Input
                value={searchText}
                placeholder="keywords"
                type="text"
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (e.target.value === '') {
                    setFilteredMatrixPenilaian(folderFile);
                  } else {
                    const filtered = folderFile.filter(
                      (el) => el.nama.toLowerCase().includes(e.target.value.toLowerCase()),
                    );
                    setFilteredMatrixPenilaian(filtered);
                  }
                }}
              />
              <Button className="mb-0 ml-3" onClick={onFetch}>Cari</Button>
            </InputGroup>
          </div>
          { isFetching && <Spinner className="table-fetch-spinner" /> }
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

Screen.propTypes = {
  params: PropTypes.shape().isRequired,
  data: PropTypes.shape().isRequired,
};
export default Screen;
