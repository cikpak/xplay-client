import React from "react";
import { Container, Row, Col, Button, ListGroup, Form } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faSignOutAlt, faSyncAlt, faPlayCircle, faEdit } from '@fortawesome/free-solid-svg-icons'
import './styles.scss'



const Main = ({ auth, userInfo, clientConfig, getRaspberryIp, handlePlay, getXboxIp, getClientZerotierIp, getClientVpnIp, openCompanion, showEditModal, getRaspberryVpnIp, setApiVersion, appConfig }) => {
  const { network, raspberryLocalIp, xboxId, xboxIp } = clientConfig
  const { apiVersion } = appConfig
  const { nickname } = userInfo
  const { logout } = auth


  return (
    <Container fluid id='mainContainer' className='vh-100'>
      <h1 className='text-center mb-4'>Hello {nickname}</h1>

      <Row>
        <Col sm='3'>
          <Form.Group controlId="exampleForm.SelectCustom">
            <Form.Label>VPN client:</Form.Label>
            <Form.Control as="select" onChange={setApiVersion}>
              <option value='1' >Zerotier</option>
              <option value='2' >Tailscale</option>
            </Form.Control>
          </Form.Group>
        </Col>

        <Col sm='9'>
          <h5 className='text-center'>Client config</h5>
          <ListGroup.Item>
            <div className="row">
              <div className="col-4">
                <b className='mr-2 d-block text-right'>Rasp local IP:</b>
              </div>
              <div className="col-7">
                {raspberryLocalIp || 'unknown'}
              </div>
              <div className="col-1">
                <FontAwesomeIcon className='mx-2 cursor-pointer' icon={faSyncAlt} onClick={getRaspberryIp} />
              </div>
            </div>
          </ListGroup.Item>

          <ListGroup.Item>
            <div className="row">
              <div className="col-4">
                <b className='mr-2 d-block text-right'>Rasp {apiVersion === '1' ? 'zerotier' : 'tailscale'} IP:</b>
              </div>
              <div className="col-7">
                {apiVersion === '1' ? network.zerotierIp ? network.zerotierIp : 'unknown' : network.tailscaleIp ? network.tailscaleIp : 'uknown'}
              </div>
              <div className="col-1">
                <FontAwesomeIcon className='mx-2' icon={faSyncAlt} onClick={getRaspberryVpnIp} />
              </div>
            </div>
          </ListGroup.Item>

          <ListGroup.Item>
            <div className="row">
              <div className="col-4">
                <b className='mr-2 d-block text-right'>Client {apiVersion === '1' ? 'zerotier' : 'tailscale'} IP:</b>
              </div>
              <div className="col-7">
                {apiVersion === '1' ? network.clientZerotierIp ? network.clientZerotierIp : 'unknown' : network.clientTailscaleIp ? network.clientTailscaleIp : 'uknown'}
              </div>
              <div className="col-1">
                <FontAwesomeIcon className='mx-2' icon={faSyncAlt} onClick={getClientVpnIp} />
              </div>
            </div>
          </ListGroup.Item>

          {
            apiVersion === '1' ?
              <ListGroup.Item >
                <div className="row">
                  <div className="col-4">
                    <b className='mr-2 d-block text-right'>Zerotier id:</b>
                  </div>
                  <div className="col-7">
                    {network.zerotierId || 'unknown'}
                  </div>
                  <div className="col-1">
                    <FontAwesomeIcon className='mx-2' icon={faEdit} onClick={() => showEditModal('zerotierId')} />
                  </div>
                </div>
              </ListGroup.Item> :

              <ListGroup.Item >
                <div className="row">
                  <div className="col-4">
                    <b className='mr-2 d-block text-right'>Tailscale id:</b>
                  </div>
                  <div className="col-7">
                    {network.tailscaleId || 'unknown'}
                  </div>
                  <div className="col-1">
                    <FontAwesomeIcon className='mx-2' icon={faEdit} onClick={() => showEditModal('tailscaleId')} />
                  </div>
                </div>
              </ListGroup.Item>
          }

          <ListGroup.Item>
            <div className="row">
              <div className="col-4">
                <b className='mr-2 d-block text-right'>Xbox IP:</b>
              </div>
              <div className="col-7">
                {xboxIp || 'unknown'}
              </div>
              <div className="col-1">
                <FontAwesomeIcon className='mx-2' icon={faSyncAlt} onClick={getXboxIp} />
              </div>
            </div>
          </ListGroup.Item>

          <ListGroup.Item>
            <div className="row">
              <div className="col-4">
                <b className='mr-2 d-block text-right'>Xbox ID:</b>
              </div>
              <div className="col-7">
                {xboxId || 'unknown'}
              </div>
              <div className="col-1">
                <FontAwesomeIcon className='mx-2' icon={faEdit} onClick={() => showEditModal('xboxId')} />
              </div>
            </div>
          </ListGroup.Item>
        </Col>
      </Row>

      <div className="mt-3">
        <Button variant='primary' className='mr-3' onClick={handlePlay}><FontAwesomeIcon className='mr-1' icon={faPlay} />Play</Button>
        <Button variant='secondary' className='mr-3' onClick={logout}><FontAwesomeIcon className='mr-1' icon={faSignOutAlt} />Logout </Button>
        <Button variant='warning' className='mr-3' onClick={openCompanion} ><FontAwesomeIcon className='mr-1' icon={faPlayCircle} />Open companion</Button>
      </div>
    </Container>
  );
};

export default Main
