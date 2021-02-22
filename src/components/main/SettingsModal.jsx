import React, { useState, useRef } from 'react'
import { Modal, Form, Col, Row, ListGroup, Button } from 'react-bootstrap'
import { faSyncAlt, faEdit, faSave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SettingsModal = ({ show, setShow, whatIsLoading, clientConfig, updateNetworkConfig, setClientConfig, appConfig, setApiVersion, getXboxIp, getRaspberryIp, getClientVpnIp, getRaspberryVpnIp, configSaveHandler }) => {
	const { network, raspberryLocalIp, xboxId, xboxIp } = clientConfig
	const { apiVersion } = appConfig
	const [fieldValue, setFieldValue] = useState({})
	const zerotierIdRef = useRef(null)
	const tailscaleIdRef = useRef(null)
	const xboxIdRef = useRef(null)

	//TODO - add can be eddited functionality
	const refsObj = {
		xboxId: xboxIdRef,
		tailscaleId: tailscaleIdRef,
		zerotierId: zerotierIdRef
	}

	const [canBeEdited, setCanBeEdited] = useState({
		xboxId: false,
		tailscaleId: false,
		zerotierId: false
	})

	const saveConfigHandler = (parameter, value) => {
		if (parameter === 'xboxId') {
			setClientConfig({ [parameter]: value })
		} else {
			updateNetworkConfig({ [parameter]: value })
		}

		setCanBeEdited({ ...canBeEdited, [parameter]: false })
	}

	return (
		<Modal show={show} onHide={setShow} centered>
			<Modal.Header closeButton>
				<Modal.Title>
					Settings
        		</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Row>
					<Col sm='12'>
						<Form.Group controlId="exampleForm.SelectCustom">
							<Form.Label>VPN client:</Form.Label>
							<Form.Control as="select" onChange={setApiVersion} value={apiVersion}>
								<option value='1' >Zerotier</option>
								<option value='2' >Tailscale (recomended)</option>
							</Form.Control>
						</Form.Group>
					</Col>

					<Col sm='12'>
						<h5 className='text-center'>Client config</h5>
						<ListGroup.Item>
							<div className="row">
								<div className="col-5">
									<b className='mr-2 d-block text-right'>Rasp local IP:</b>
								</div>
								<div className="col-5">
									{raspberryLocalIp || 'unknown'}
								</div>
								<div className="col-2">
									<FontAwesomeIcon className='mx-2 cursor-pointer' icon={faSyncAlt} onClick={getRaspberryIp} spin={whatIsLoading.raspLocalIp} />
								</div>
							</div>
						</ListGroup.Item>

						<ListGroup.Item>
							<div className="row">
								<div className="col-5">
									<b className='mr-2 d-block text-right'>Rasp {apiVersion === '1' ? 'zerotier' : 'tailscale'} IP:</b>
								</div>
								<div className="col-5">
									{apiVersion === '1' ? network.zerotierIp ? network.zerotierIp : 'unknown' : network.tailscaleIp ? network.tailscaleIp : 'uknown'}
								</div>
								<div className="col-2">
									<FontAwesomeIcon className='mx-2' icon={faSyncAlt} onClick={getRaspberryVpnIp} spin={whatIsLoading.raspVpnIp} />
								</div>
							</div>
						</ListGroup.Item>

						<ListGroup.Item>
							<div className="row">
								<div className="col-5">
									<b className='mr-2 d-block text-right'>Client {apiVersion === '1' ? 'zerotier' : 'tailscale'} IP:</b>
								</div>
								<div className="col-5">
									{apiVersion === '1' ? network.clientZerotierIp ? network.clientZerotierIp : 'unknown' : network.clientTailscaleIp ? network.clientTailscaleIp : 'uknown'}
								</div>
								<div className="col-2">
									<FontAwesomeIcon className='mx-2' icon={faSyncAlt} onClick={getClientVpnIp} spin={whatIsLoading.clientVpnIp} />
								</div>
							</div>
						</ListGroup.Item>

						<ListGroup.Item>
							<div className="row">
								<div className="col-5">
									<b className='mr-2 d-block text-right'>Xbox IP:</b>
								</div>
								<div className="col-5">
									{xboxIp || 'unknown'}
								</div>
								<div className="col-2">
									<FontAwesomeIcon className='mx-2' icon={faSyncAlt} onClick={getXboxIp} spin={whatIsLoading.xboxIp} />
								</div>
							</div>
						</ListGroup.Item>

						{
							apiVersion === '1' ?
								<ListGroup.Item >
									<div className="row">
										<div className="col-5">
											<b className='mr-2 d-block text-right'>Zerotier id:</b>
										</div>
										<div className="col-5">
											{
												canBeEdited.zerotierId ?
													<Form.Control type="text" name='zerotierId' ref={zerotierIdRef} onChange={event => setFieldValue({ ...fieldValue, 'zerotierId': event.target.value })} /> :
													network.zerotierId || 'unknown'
											}
										</div>
										<div className="col-2">
											{
												!canBeEdited.zerotierId ?
													<FontAwesomeIcon
														className='mx-2'
														icon={faEdit}
														onClick={() => setCanBeEdited({ ...canBeEdited, 'zerotierId': !canBeEdited.zerotierId })}
													/> :
													<FontAwesomeIcon
														className='mx-2'
														icon={faSave}
														onClick={() => saveConfigHandler('zerotierId', zerotierIdRef.current.value)}
													/>
											}
										</div>
									</div>
								</ListGroup.Item> :

								<ListGroup.Item >
									<div className="row">
										<div className="col-5">
											<b className='mr-2 d-block text-right'>Tailscale id:</b>
										</div>
										<div className="col-5">
											{
												canBeEdited.tailscaleId ?
													<Form.Control type="text" name='tailscaleId' ref={tailscaleIdRef} onChange={event => setFieldValue({ ...fieldValue, 'tailscaleId': event.target.value })} /> :
													network.tailscaleId || 'unknown'
											}
										</div>
										<div className="col-2">
											{
												!canBeEdited.tailscaleId ?
													<FontAwesomeIcon
														className='mx-2'
														icon={faEdit}
														onClick={() => setCanBeEdited({ ...canBeEdited, 'tailscaleId': !canBeEdited.tailscaleId })}
													/> :
													<FontAwesomeIcon
														className='mx-2'
														icon={faSave}
														onClick={() => saveConfigHandler('tailscaleId', tailscaleIdRef.current.value)}
													/>
											}
										</div>
									</div>
								</ListGroup.Item>
						}

						<ListGroup.Item>
							<div className="row">
								<div className="col-5">
									<b className='mr-2 d-block text-right'>Xbox ID:</b>
								</div>
								<div className="col-5">
									{
										canBeEdited.xboxId ?
											<Form.Control type="text" ref={xboxIdRef} onChange={event => setFieldValue({ ...fieldValue, [event.target.name]: event.target.value })} /> :
											xboxId || 'unknown'
									}
								</div>
								<div className="col-2">
									{
										!canBeEdited.xboxId ?
											<FontAwesomeIcon
												className='mx-2'
												icon={faEdit}
												onClick={() => setCanBeEdited({ ...canBeEdited, 'xboxId': !canBeEdited.xboxId })}
											/> :
											<FontAwesomeIcon
												className='mx-2'
												icon={faSave}
												onClick={() => saveConfigHandler('xboxId', xboxIdRef.current.value)}
											/>
									}
								</div>
							</div>
						</ListGroup.Item>
					</Col>
				</Row>
			</Modal.Body>

			<Modal.Footer>
				<Button variant='secondary' onClick={setShow}>Close</Button>
				<Button variant='primary' onClick={configSaveHandler}>Save</Button>
			</Modal.Footer>
		</Modal>
	)
}


export default SettingsModal