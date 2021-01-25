import React from 'react'
import { Modal } from 'react-bootstrap'
import { CopyToClipboard } from 'react-copy-to-clipboard'


const EditModal = ({ show, setShow, ip }) => {

    return <Modal centered show={show} onHide={setShow}>
        <Modal.Header closeButton>
            <Modal.Title>Copy ip!</Modal.Title>
        </Modal.Header>

        <Modal.Body className='d-flex'>
            <CopyToClipboard text={ip} onCopy={setShow}>
                <h4 className='text-center' id='ip'>{ip}</h4>
            </CopyToClipboard>
            <p>Click to copy!</p>
        </Modal.Body>
    </Modal>
}


export default EditModal