import React, { useState } from 'react'
import { Modal, InputGroup, FormControl, Button } from 'react-bootstrap'

const EditModal = ({ show, parameter, setShow, updateParameter }) => {
    const [value, setValue] = useState(null);

    const paramDict = {
        zerotierId: {
            title: "Enter zerotier network ID",
            short: 'Network ID:'
        },
        xboxId: {
            title: 'Enter Xbox console ID',
            short: 'Xbox ID:'
        },
        tailscaleId: {
            title: "Enter tailscale network ID",
            short: 'Network ID:'
        },
    }

    return <Modal centered show={show} onHide={setShow}>
        <Modal.Header closeButton>
            <Modal.Title>{parameter ? paramDict[parameter].title : ''}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <InputGroup className="mb-3">
                <InputGroup.Prepend >
                    <InputGroup.Text id="basic-addon3"> {parameter ? paramDict[parameter].short : ''} </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onChange={event => setValue(event.target.value)} />
            </InputGroup>
        </Modal.Body>

        <Modal.Footer>
            <Button variant="primary" onClick={() => updateParameter(value)}>Save</Button>
        </Modal.Footer>
    </Modal>
}


export default EditModal