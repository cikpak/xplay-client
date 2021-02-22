import React, { Fragment, useRef } from 'react'
import { Container, Modal, Form, Row, Col, Button } from 'react-bootstrap'
import avatar from '../../assets/images/avatar.png'
import { Formik } from 'formik'
import env from '../../env'


const EditProfileModal = ({ user, show, setShow, accountUpdateHandler }) => {
	const { nickname, firstname, lastname, email } = user

	const fileUploadRef = useRef()

	const handleAvatarUpload = (event) => {
		event.preventDefault()
		fileUploadRef.current.click()
	}

	return (
		<Modal show={show} onHide={setShow} centered>
			<Modal.Body>
				<Container fluid>
					<Formik
						initialValues={{ firstname: firstname || '', lastname: lastname || '', nickname: nickname || '', email: email || '', avatar: '' }}
						onSubmit={accountUpdateHandler}
					>
						{({ values, handleChange, handleSubmit, setFieldValue }) => {
							return (
								<Fragment>
									<form onSubmit={handleSubmit}>
										<div id='modalAvatarContainer'>
											<div id='editWrapper' className='text-center'>
												<div id='edit' onClick={handleAvatarUpload}>Edit</div>
												<input ref={fileUploadRef} type="file" name='avatar' id="avatar" style={{ display: 'none' }} onChange={(event) => {
													setFieldValue("avatar", event.target.files[0]);
												}} />
												<img src={(user.avatar !== '' && user.avatar) ? `${env.API_BASE_URL}${user.avatar}` : avatar} alt={`${nickname}'s avatar`} className='' />
											</div>
											<p className='d-block mx-auto text-center m-0'>{nickname || '...'}</p>
										</div>
										<h5 className='text-center'>Profile</h5>
										<hr />
										<Row>
											<Col>
												<Form.Group>
													<Form.Label>Firstname:</Form.Label>
													<Form.Control
														id='firstname'
														type="text"
														name="firstname"
														onChange={handleChange}
														value={values.firstname}
													/>
												</Form.Group>
											</Col>
											<Col>
												<Form.Group>
													<Form.Label>Lastname:</Form.Label>
													<Form.Control
														id='lastname'
														type="text"
														name="lastname"
														onChange={handleChange}
														value={values.lastname}
													/>
												</Form.Group>
											</Col>
										</Row>

										<Row>
											<Col sm={6}>
												<Form.Group>
													<Form.Label>Email:</Form.Label>
													<Form.Control
														id='email'
														type="email"
														name="email"
														onChange={handleChange}
														value={values.email}
													/>
												</Form.Group>
											</Col>
											<Col sm={6}>
												<Form.Group>
													<Form.Label>Nickname:</Form.Label>
													<Form.Control
														id='nickname'
														type="text"
														name="nickname"
														onChange={handleChange}
														value={values.nickname}
													/>
												</Form.Group>
											</Col>
										</Row>
										<Modal.Footer>

											<Button variant='primary' role='submit' type='submit'>Save</Button>
											<Button variant='secondary' onClick={setShow}>Close</Button>
										</Modal.Footer>
									</form>
								</Fragment>
							)
						}}
					</Formik>
				</Container>
			</Modal.Body>
		</Modal >
	)
}


export default EditProfileModal