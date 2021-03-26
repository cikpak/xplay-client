import { Row, Col, Container, Dropdown } from 'react-bootstrap'
import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import xbox from '../../assets/images/xbox.png'
import controller from '../../assets/images/controller.png'
import ethernet from '../../assets/images/ethernet.png'
import wifi from '../../assets/images/wifi.png'
import raspberry from '../../assets/images/rasp.png'
import question from '../../assets/images/question.png'

export default function SystemStats({ systemStats, handleRaspberryReboot, tryPowerOnXbox, whatIsLoading, handleSocketRefresh }) {
    const { raspReboot } = whatIsLoading

    return (
        <Container>
            <Row className='mt-3'>
                <Col xs={6} className='w-auto m-auto text-center'>
                    <div className='dropdown-wrapper'>
                        <Dropdown>
                            <Dropdown.Toggle as='div'>
                                <div id="consoleName" className='d-flex justify-content-center align-content-center'>
                                    <h3 className='mb-0'>Xbox Series X</h3>
                                    <FontAwesomeIcon icon={faChevronDown} className='ml-2 mt-2' />
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Header>XBOX</Dropdown.Header>
                                <Dropdown.Item onClick={tryPowerOnXbox}>Try to on</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className='d-flex justify-content-center align-items-center'>
                        <div id='xboxStatusCircle' className='rounded-circle mr-1 shadow'></div>
                        <span>Available</span>
                    </div>
                </Col>
            </Row>
            <Row>
                <img src={xbox} alt="xbox console" id='xboxImage' />
            </Row>
            <Row className='mt-2'>
                <Col xs={12} className='m-auto text-center'>
                    <Row>
                        <Col xs={4} className='system-stats'>
                            <div className="stat-icon-wrapper">
                                <img src={controller} alt="controller" className='stat-icon' />
                            </div>
                            <span>connected</span>
                        </Col>
                        <Col xs={4} className='dropdown-wrapper'>
                            <div className="stat-icon-wrapper">
                                {raspReboot ? <FontAwesomeIcon icon={faSyncAlt} spin /> : <img src={raspberry} alt="raspberry" className='stat-icon' />}

                            </div>
                            <Dropdown>
                                {raspReboot ? 'Rebooting' :
                                    <Dropdown.Toggle as='div' className='d-flex justify-content-center align-content-center'>
                                        <div className='mr-1'>{systemStats.raspberry ? 'connected' : 'detached'}</div>
                                        <FontAwesomeIcon icon={faChevronDown} className='mt-1' />
                                    </Dropdown.Toggle>
                                }
                                <Dropdown.Menu>
                                    <Dropdown.Header>Raspberry</Dropdown.Header>

                                    <Dropdown.Item onClick={handleSocketRefresh}>Reconnect</Dropdown.Item>
                                    <Dropdown.Item onClick={handleRaspberryReboot}>Restart</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        <Col xs={4} className='system-stats'>
                            <div className="stat-icon-wrapper">
                                <img src={systemStats.network.wifi ? wifi : systemStats.network.ethernet ? ethernet : question} alt={systemStats.network.wifi ? 'wifi' : 'ethernet'} className='stat-icon' />
                            </div>
                            <span>{systemStats.network.wifi ? 'Wi-Fi' : systemStats.network.ethernet ? 'Ethernet' : 'no internet :('}</span>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}
