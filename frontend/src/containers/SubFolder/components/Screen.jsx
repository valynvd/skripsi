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
import ListItem from '@mui/material/ListItem';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import dataApi from '../../../utils/dataApi';
import CreateForm from './CreateForm';
import DeleteForm from './DeleteForm';
import EditForm from './EditForm';

const Screen = ({ params }) => {
  const [searchText, setSearchText] = useState('');
  const [folderFile, setfolderFile] = useState([]);
  const [isFetching, setFetching] = useState(true);
  const [currentFileFolder, setCurrentFileFolder] = useState(null);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const [isDeleteFormOpen, setDeleteFormOpen] = useState(false);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedDataEdit, setSelectedDataEdit] = useState(null);
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

  const openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const onFetch = () => {
    setFetching(false);
  };

  const handleCreateForm = () => {
    setCreateFormOpen(true);
  };

  const handleCloseForm = () => {
    setCreateFormOpen(false);
  };

  const handleDeleteForm = (val) => {
    setDeleteFormOpen(true);
    setSelectedData(val);
  };

  const closeDeleteForm = () => {
    setDeleteFormOpen(false);
    setSelectedData(null);
  };

  const handleEditForm = (val) => {
    setSelectedDataEdit(val);
    setEditFormOpen(true);
  };

  const closeEditForm = () => {
    setEditFormOpen(false);
    setSelectedDataEdit(null);
  };

  const folders = folderFile.map((val) => (
    <ListItem key={val.id} disablePadding>
      {val.jenis === 'folder' ? (
        <div style={{ width: '100%' }}>
          <Box
            sx={{
              display: 'flex', borderRadius: 1,
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
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
            </Box>
            <Box className="align-self-center">
              <Button
                onClick={() => {
                  handleEditForm(val);
                }}
                variant="transparent"
                startIcon={<ModeEditIcon />}
                className="icon"
              >
                <h5 className="bold-text">Edit</h5>
              </Button>
            </Box>
            <Box className="align-self-center">
              <Button
                onClick={() => {
                  handleDeleteForm(val);
                }}
                variant="transparent"
                startIcon={<DeleteIcon />}
                className="icon"
              >
                <h5 className="bold-text">Delete</h5>
              </Button>
            </Box>
          </Box>
          <Divider />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <Box
            sx={{
              display: 'flex', borderRadius: 1,
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <ListItemButton onClick={() => openInNewTab(val.files)}>
                <ListItemIcon>
                  <InsertDriveFileIcon className="icon" />
                </ListItemIcon>
                <ListItemText>
                  <p>{val.nama}</p>
                </ListItemText>
              </ListItemButton>

            </Box>
            <Box className="align-self-center">
              <Button
                onClick={() => {
                  handleEditForm(val);
                }}
                variant="transparent"
                startIcon={<ModeEditIcon />}
                className="icon"
              >
                <h5 className="bold-text">Edit</h5>
              </Button>
            </Box>
            <Box className="align-self-center">
              <Button
                onClick={() => {
                  handleDeleteForm(val);
                }}
                variant="transparent"
                startIcon={<DeleteIcon />}
                className="icon"
              >
                <h5 className="bold-text">Delete</h5>
              </Button>
            </Box>
          </Box>
          <Divider />
        </div>
      )}
    </ListItem>
  ));

  return (
    <Col md={12}>
      <CreateForm data={currentFileFolder} isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
      <DeleteForm data={selectedData} isOpen={isDeleteFormOpen} handleClose={closeDeleteForm} />
      <EditForm data={selectedDataEdit} isOpen={isEditFormOpen} handleClose={closeEditForm} />
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
          <Box>
            <div className="pl-3 pb-1">
              <AddCircleOutlineIcon onClick={handleCreateForm} className="icon" />
            </div>
            <Divider />
            {folders}
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
