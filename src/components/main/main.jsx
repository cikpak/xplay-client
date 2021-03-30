import React from "react";

import { faPlay, faChevronDown, faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Container, Button, Dropdown } from 'react-bootstrap'
import avatar from '../../assets/images/avatar.png'
import logo from '../../assets/images/xplay.png'
import SystemStats from './SystemStats.jsx'
import NetStats from './NetStats.jsx'
import './styles.scss'
import env from '../../env'

const Main = ({ auth, user, showAccountModal, userInfo, tryPowerOnXbox, handleSocketRefresh, handleRaspberryReboot, showAboutModal, handlePlay, showSettingsModal, stats, testNetConnection, whatIsLoading, data, systemStats }) => {

  return <div id='main'>
    <Container fluid id="mainHeader" className='d-flex justify-content-between align-items-center py-1 shadow'>
      <div>
        <img src={logo} alt='XPlay logo' />
      </div>

      <div id='avatarContainer' >
        <Dropdown>
          <Dropdown.Toggle>
            <img src={(user.avatar !== '' && user.avatar) ? `${env.API_BASE_URL}${user.avatar}` : avatar} alt='user avatar' className='rounded-circle mr-1' />
            <FontAwesomeIcon icon={faChevronDown} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Header>{user.nickname}</Dropdown.Header>
            <Dropdown.Item onClick={showAccountModal}>Account</Dropdown.Item>
            <Dropdown.Item onClick={showSettingsModal}>Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={showAboutModal}>About</Dropdown.Item>
            <Dropdown.Item onClick={auth.logout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </Container>

    <SystemStats
      handleRaspberryReboot={handleRaspberryReboot}
      handleSocketRefresh={handleSocketRefresh}
      tryPowerOnXbox={tryPowerOnXbox}
      whatIsLoading={whatIsLoading}
      isClientConfigured={userInfo.isClientConfigured}
      systemStats={systemStats}
    />

    <NetStats
      stats={stats}
      testNetConnection={testNetConnection}
      isClientConfigured={userInfo.isClientConfigured}
      isLoading={whatIsLoading.netTest}
      data={data}
    />

    <Container fluid className='p-0 m-0' id="playButtonContainer">
      <dfn title={userInfo.isClientConfigured ? 'Click to start play!' : 'You cant play if client is not configured!'}>
        <Button variant={userInfo.isClientConfigured ? 'success' : 'warning'} block className='m-0 rounded-0 shadow-lg' onClick={handlePlay} disabled={!userInfo.isClientConfigured} disabled={whatIsLoading.play}>
          <FontAwesomeIcon className='mr-1' icon={whatIsLoading.play ? faSyncAlt : faPlay} spin={whatIsLoading.play} />
          Play
          </Button>
      </dfn>
    </Container>
  </div>
};

export default Main
