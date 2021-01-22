import React from 'react'
import { Modal } from 'react-bootstrap'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CopyToClipboard } from 'react-copy-to-clipboard'


const EditModal = ({ show, setShow, ip }) => {

    return <Modal centered show={show} onHide={setShow}>
        <Modal.Header closeButton>
            <Modal.Title>Copy ip!</Modal.Title>
        </Modal.Header>

        <Modal.Body className='d-flex'>
            <h4 className='text-center' id='ip'>{ip}</h4>
            <CopyToClipboard text={ip} onCopy={setShow}>
                <FontAwesomeIcon size='2x' className='mx-2' icon={faCopy} />
            </CopyToClipboard>
        </Modal.Body>
    </Modal>
}


export default EditModal