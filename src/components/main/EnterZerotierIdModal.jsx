import React, { useRef, useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import Formik from 'formik'

export default ({ show, setShow, handleWizardSubmit }) => {
    const fieldRef = useRef(null)
    const [fieldValue, setFieldValue] = useState({});

    console.log('show :>> ', show);

    return (
        <Modal centered show={show} onHide={() => { }} >
            <Modal.Header>Enter Zerotier ID</Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Network ID:</Form.Label>
                    <Form.Control
                        type='text'
                        name='zerotierId'
                        ref={fieldRef}
                        onChange={
                            (event) => setFieldValue({ ...fieldValue, [event.target.name]: event.target.value })
                        }
                    />
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant='secondary' onClick={() => setShow('enterZerotierId')}>Cancel</Button>
                <Button variant='primary' onClick={() => handleWizardSubmit(fieldValue)}>Save</Button>
            </Modal.Footer>
        </Modal>
    )
}
