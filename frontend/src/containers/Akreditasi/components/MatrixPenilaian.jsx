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
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Divider from '@mui/material/Divider';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import dataApi from '../../../utils/dataApi';
import CreateForm from './CreateForm';

const MatrixPenilaian = () => {
  const [searchText, setSearchText] = useState('');
  const [matrixPenilaian, setMatrixPenilaian] = useState([]);
  const [filteredMatrixPenilaian, setFilteredMatrixPenilaian] = useState([]);
  const [isFetching, setFetching] = useState(true);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const history = useHistory();

  const getData = async () => {
    try {
      const resp = await dataApi.getMatrixPenilaian();
      return resp;
    } catch (error) {
      return [];
    }
  };
  useEffect(async () => {
    const matrix = await getData();
    setMatrixPenilaian(matrix.data);
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
      <ListItemButton onClick={() => {
        history.push(`/dashboard/folder/${val.id}`, {
          data: val,
        });
      }}
      >
        <ListItemIcon>
          <FolderOpenIcon />
        </ListItemIcon>
        <ListItemText primary={`${val.kode} ${val.element}`} />
      </ListItemButton>
    </ListItem>
  ));

  return (
    <Col md={12}>
      <CreateForm isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
      <Card>
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">Matrix Penilaian</h5>
            <h5 className="subhead">Data berdasarkan lampiran 6a BAN PT</h5>
          </div>
          <div className="mb-3">
            <InputGroup className="d-flex align-items-center">
              <Input
                value={searchText}
                placeholder="keywords"
                type="text"
                onChange={(e) => {
                  // eslint-disable-next-line no-console
                  console.log(e.target.value);
                  setSearchText(e.target.value);
                  if (e.target.value === '') {
                    setFilteredMatrixPenilaian(matrixPenilaian);
                  } else {
                    const filtered = matrixPenilaian.filter(
                      (el) => el.element.toLowerCase().includes(e.target.value.toLowerCase()),
                    );
                    setFilteredMatrixPenilaian(filtered);
                  }
                }}
              />
              <Button className="mb-0 ml-3" onClick={onFetch}>Cari</Button>
            </InputGroup>
          </div>
          { isFetching && <Spinner className="table-fetch-spinner" /> }
          <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <div className="pl-3 pb-1">
              <AddCircleOutlineIcon onClick={handleCreateForm} />
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

export default MatrixPenilaian;
