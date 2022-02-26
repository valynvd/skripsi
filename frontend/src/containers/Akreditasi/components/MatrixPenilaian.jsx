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
import Divider from '@mui/material/Divider';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import dataApi from '../../../utils/dataApi';

const MatrixPenilaian = () => {
  const [searchText, setSearchText] = useState('');
  const [matrixPenilaian, setMatrixPenilaian] = useState([]);
  const [isFetching, setFetching] = useState(true);
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
    setFetching(false);
  }, []);

  const onFetch = () => {
    setFetching(false);
  };

  const folders = matrixPenilaian.map((val) => (
    <ListItem key={val.id} disablePadding>
      <ListItemButton onClick={() => {
        history.push(`/dashboard/folder1/${val.id}`, {
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
                }}
              />
              <Button className="mb-0 ml-3" onClick={onFetch}>Cari</Button>
            </InputGroup>
          </div>
          { isFetching && <Spinner className="table-fetch-spinner" /> }
          <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
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
