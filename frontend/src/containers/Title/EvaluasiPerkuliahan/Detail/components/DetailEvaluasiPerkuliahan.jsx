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
  Card, CardBody, Col, Spinner,
} from 'reactstrap';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Divider from '@mui/material/Divider';
import CreateForm from './CreateForm';
import EditForm from './EditForm';
import DeleteForm from './DeleteForm';
import dataApi from '../../../../../utils/dataApi';

const DetailEvaluasiPerkuliahan = ({ id }) => {
  const [post, setPost] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [isFetching, setFetching] = useState(true);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [isDeleteFormOpen, setDeleteFormOpen] = useState(false);
  const history = useHistory();

  const getData = async () => {
    try {
      const resp = await dataApi.getEvaluasiPerkuliahan();
      return resp;
    } catch (error) {
      return [];
    }
  };
  useEffect(async () => {
    const matrix = await getData();
    setPost(matrix.data);
    setFetching(false);
  }, []);

  const openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const handleCreateForm = () => {
    setCreateFormOpen(true);
  };

  const handleCloseForm = () => {
    setCreateFormOpen(false);
  };

  const handleEditForm = () => {
    setEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setEditFormOpen(false);
  };

  const handleDeleteForm = () => {
    setDeleteFormOpen(true);
  };

  const handleCloseDeleteForm = () => {
    setDeleteFormOpen(false);
  };

  const printPenugasan = () => {
    const test = [
      isFetching === false
        ? (
          <>
            <CreateForm isOpen={isCreateFormOpen} handleClose={handleCloseForm} />
            <div className="card__title">
              <h5 className="bold-text">Detail</h5>
            </div>

            <AddCircleOutlineIcon className="icon" onClick={handleCreateForm} />
            <Divider />

            <h5>No Data Available At This Page</h5>
          </>
        )
        : <div />,
    ];
    for (let i = 0; i < post.length; i++) {
      const Id = parseInt(id, 10);
      if (post[i].penugasan === Id) {
        test.push(
          <>
            <div className="card__title">
              <h5 className="bold-text">Detail</h5>
            </div>

            <div className="row pl-3">
              <ModeEditIcon className="icon mr-2" onClick={() => handleEditForm()} />
              <DeleteIcon className="icon ml-2" onClick={() => handleDeleteForm()} />
            </div>

            <Divider />

            <ListItemButton onClick={() => openInNewTab(`${post[i].rps}`)}>
              <ListItemIcon>
                <InsertDriveFileIcon className="icon" />
              </ListItemIcon>
              <ListItemText>
                <p>RPS</p>
              </ListItemText>
            </ListItemButton>

            <ListItemButton onClick={() => openInNewTab(`${post[i].evaluation_report}`)}>
              <ListItemIcon>
                <InsertDriveFileIcon className="icon" />
              </ListItemIcon>
              <ListItemText>
                <p>Evaluation Report</p>
              </ListItemText>
            </ListItemButton>

            <ListItemButton onClick={() => openInNewTab(`${post[i].rubrik}`)}>
              <ListItemIcon>
                <InsertDriveFileIcon className="icon" />
              </ListItemIcon>
              <ListItemText>
                <p>Rubrik</p>
              </ListItemText>
            </ListItemButton>

            <br />
            <h5 className="bold-text">NOTES</h5>
            <p>{post[i].notes}</p>
            <EditForm data={post[i]} isOpen={isEditFormOpen} handleClose={handleCloseEditForm} />
            <DeleteForm data={post[i]} isOpen={isDeleteFormOpen} handleClose={handleCloseDeleteForm} />
          </>,
        );
        test.shift();
      }
    }
    return test;
  };

  return (
    <Col md={12}>
      <Card>
        <CardBody>
          {/* <div className="card__title">
            <h5 className="bold-text">Detail</h5>
          </div> */}
          {printPenugasan()}
          { isFetching && <Spinner className="spinner table-fetch-spinner" /> }
        </CardBody>
      </Card>
    </Col>
  );
};

export default DetailEvaluasiPerkuliahan;
