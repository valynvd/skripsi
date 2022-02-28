/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  Col,
  Input,
  InputGroup,
  Spinner,
  Row,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import dataApi from '../../../utils/dataApi';
import CreateForm from './CreateForm';

const Screen = ({ params }) => {
  const [searchText, setSearchText] = useState('');
  const [folderFile, setfolderFile] = useState([]);
  const [isFetching, setFetching] = useState(true);
  const [currentFileFolder, setCurrentFileFolder] = useState(null);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const [label, setLabel] = useState('');
  const history = useHistory();

  const getData = async () => {
    try {
      const resp = await dataApi.getFolderbyFolder(params.id);
      return resp;
    } catch (error) {
      return [];
    }
  };
  const getFileFolder = async () => {
    try {
      const resp = await dataApi.getCurrentFileFolder(params.id);
      return resp;
    } catch (error) {
      return [];
    }
  };
  useEffect(async () => {
    const folders = await getData();
    const currentFF = await getFileFolder();
    setCurrentFileFolder(currentFF.data);
    setfolderFile(folders.data);
    if (folders.data.length > 0) {
      const firstData = folders.data[0];
      const parent = firstData.parent_folder;
      setLabel(parent.nama);
    }
    setFetching(false);
  }, [params]);

  const onFetch = () => {
    setFetching(false);
  };

  const handleCreateForm = () => {
    setCreateFormOpen(true);
  };

  const handleCloseForm = () => {
    setCreateFormOpen(false);
  };

  const folders = folderFile.map((val) => (
    <ListItem key={val.id} disablePadding>
      {val.jenis === 'folder' ? (
        <div className="pl-2" style={{ width: '100%' }}>
          <Box
            sx={{
              display: 'flex', p: 1, bgcolor: 'background.paper', borderRadius: 1,
            }}
          >
            <Box sx={{ flexGrow: 1 }}><FolderOpenIcon />
              <Box className="pl-4" sx={{ display: 'inline' }}>
                <Button onClick={() => {
                  if (val.jenis === 'folder') {
                    history.push(`/dashboard/subfolder/${val.id}`);
                  } else {
                    window.open(val.files);
                  }
                }}
                >{val.nama}
                </Button>
              </Box>
            </Box>
            <Box>
              <Button variant="transparent" startIcon={<ModeEditIcon />}>
                Edit
              </Button>
            </Box>
            <Box>
              <Button variant="transparent" startIcon={<DeleteIcon />}>
                Delete
              </Button>
            </Box>
          </Box>
        </div>
      ) : (
        <div className="pl-2" style={{ width: '100%' }}>
          <Box
            sx={{
              display: 'flex', p: 1, bgcolor: 'background.paper', borderRadius: 1,
            }}
          >
            <Box sx={{ flexGrow: 1 }}><InsertDriveFileIcon />
              <Box className="pl-4" sx={{ display: 'inline' }}>
                <Button href={val.files} target="_blank">{val.nama}</Button>
              </Box>
            </Box>
            <Box>
              <Button variant="transparent" startIcon={<ModeEditIcon />}>
                Edit
              </Button>
            </Box>
            <Box>
              <Button variant="transparent" startIcon={<DeleteIcon />}>
                Delete
              </Button>
            </Box>
          </Box>
        </div>
      )}
    </ListItem>
  ));

  return (
    <Col md={12}>
      <CreateForm data={currentFileFolder} isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
      <Card>
        <Row>
          <Col md={12}>
            <h3 className="page-title">{label}</h3>
          </Col>
        </Row>
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

Screen.propTypes = {
  params: PropTypes.shape().isRequired,
};
export default Screen;
