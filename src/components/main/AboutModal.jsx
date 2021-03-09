import React from 'react'
import { Modal, Button } from 'react-bootstrap'
const shell = require('electron').shell
import projectInfo from '../../../package.json'
import logo from '../../assets/images/xplay.png'
import githubLogo from '../../assets/images/github.png'

export default ({ show, setShow }) => {
    return (
        <Modal centered show={show} onHide={setShow}>
            <Modal.Header className='d-block'>
                <img src={logo} alt="xplay logo" className='d-block m-auto' />
                <Modal.Title className='d-block m-auto text-center'>XPlay Personal v. {projectInfo.version}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <img
                    src={githubLogo}
                    className='about-logo d-block m-auto'
                    alt="link to xplay client repo"
                    onClick={() => shell.openExternal(projectInfo.repository.url)}
                />
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={setShow}>Close</Button>
            </Modal.Footer>
        </Modal>
    )

}
