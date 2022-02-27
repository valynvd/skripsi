/* eslint-disable react/prop-types */
/* eslint-disable no-plusplus */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Card, CardBody, Col } from 'reactstrap';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const DetailEvaluasiPerkuliahan = ({ id }) => {
  const [post, setPost] = useState([]);
  const [penugasan, setPenugasan] = useState([]);
  const [open, setOpen] = React.useState(false);
  const history = useHistory();

  const handleClick = () => {
    setOpen(!open);
  };

  useEffect(() => {
    axios.get('https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/evaluasiperkulian/', { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        setPost(response.data);
      });

    axios.get('https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/api-stem/penugasanpengajaran/', { headers: { Authorization: 'Token 09c9448751b03b41f5f5da66e549aa3290eef362' } })
      .then((response) => {
        setPenugasan(response.data);
      });
  }, []);

  const openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const printPenugasan = () => {
    const test = [];
    for (let i = 0; i < post.length; i++) {
      const Id = parseInt(id, 10);
      if (post[i].id === Id) {
        test.push(
          <>
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
          </>,
        );
      }
    }
    return test;
  };

  return (
    <Col md={12}>
      <Card>
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">Detail</h5>
          </div>
          {printPenugasan()}
        </CardBody>
      </Card>
    </Col>
  );
};

export default DetailEvaluasiPerkuliahan;
