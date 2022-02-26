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
import Divider from '@mui/material/Divider';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import dataApi from '../../../utils/dataApi';

const Screen = ({ params }) => {
  const [searchText, setSearchText] = useState('');
  const [folderFile, setfolderFile] = useState([]);
  const [isFetching, setFetching] = useState(true);
  const history = useHistory();

  const getData = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('params', params.id);
      const resp = await dataApi.getFolderbyFolder(params.id);
      return resp;
    } catch (error) {
      return [];
    }
  };
  useEffect(async () => {
    const matrix = await getData();
    // eslint-disable-next-line no-console
    console.log('holaaa', matrix);
    setfolderFile(matrix.data);
    setFetching(false);
  }, [params]);

  const onFetch = () => {
    setFetching(false);
  };

  const folders = folderFile.map((val) => {
    // eslint-disable-next-line no-console
    console.log(val);
    return (
      <ListItem key={val.id} disablePadding>
        <ListItemButton onClick={() => {
          history.push(`/dashboard/subfolder/${val.id}`);
        }}
        >
          <ListItemIcon>
            <FolderOpenIcon />
          </ListItemIcon>
          <ListItemText primary={`${val.nama}`} />
        </ListItemButton>
      </ListItem>
    );
  });

  return (
    <Col md={12}>
      <Card>
        <CardBody>
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

Screen.propTypes = {
  params: PropTypes.shape().isRequired,
};
export default Screen;
