import { Row, Col, Container } from 'react-bootstrap'
import React from 'react'

import xbox from '../../assets/images/xbox.png'
import controller from '../../assets/images/controller.png'
import ethernet from '../../assets/images/ethernet.png'
import wifi from '../../assets/images/wifi.png'
import raspberry from '../../assets/images/rasp.png'
import question from '../../assets/images/question.png'

export default function SystemStats({ systemStats }) {

    return (
        <Container>
            <Row className='mt-3'>
                <Col className='text-center'>
                    <h3 className='mb-0'>Xbox Series X</h3>
                    <div className='d-flex justify-content-center align-items-center'>
                        <div id='xboxStatusCircle' className='rounded-circle mr-1 shadow'></div>
                        <span>Available</span>
                    </div>
                </Col>
            </Row>
            <Row>
                <div id='xboxStatus'></div>
                <img src={xbox} alt="xbox console" id='xboxImage' />
            </Row>
            <Row className='mt-2'>
                <Col xs={10} className='m-auto text-center'>
                    <Row>
                        <Col xs={4}>
                            <div className="stat-icon-wrapper">
                                <img src={controller} alt="controller" className='stat-icon' />
                            </div>
                            <span>connected</span>
                        </Col>
                        <Col xs={4}>
                            <div className="stat-icon-wrapper">
                                <img src={raspberry} alt="raspberry" className='stat-icon' />
                            </div>
                            <span>{systemStats.raspberry ? 'connected' : 'disconnected'}</span>
                        </Col>
                        <Col xs={4}>
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
