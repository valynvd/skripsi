/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  Button,
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Divider from '@mui/material/Divider';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import dataApi from '../../../utils/dataApi';
import CreateForm from './CreateForm';

const Screen = ({ params, data }) => {
  const [searchText, setSearchText] = useState('');
  const [folderFile, setfolderFile] = useState([]);
  const [isFetching, setFetching] = useState(true);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
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
  const folders = filteredMatrixPenilaian.map((val) => (
    <ListItem key={val.id} disablePadding>
      {val.jenis === 'folder' ? (
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
      ) : (
        <ListItemButton onClick={() => { window.open(val.files); }}>
          <ListItemIcon>
            <FilePresentIcon className="icon" />
          </ListItemIcon>
          <ListItemText>
            <p>{val.nama}</p>
          </ListItemText>
        </ListItemButton>
      )}
    </ListItem>
  ));

  return (
    <Col md={12}>
      <CreateForm data={data} isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
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
