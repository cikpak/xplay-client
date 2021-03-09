import React, { Fragment } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { faTachometerAlt, faSyncAlt, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NetTestError from './NetTestError.jsx'
import NetChart from './NetChart.jsx'

export default function NetStats({ stats, testNetConnection, isLoading, data }) {
	const { ping, min, max, lostPackages } = stats
	return (
		<Container fluid className='m-0 p-0' id='netStats'>
			<Row className='m-0 p-0'>
				<Col xs={10} className='m-0 p-0'>
					<Row className='m-0 p-0 text-center'>
						<Col xs={4}>
							<span className='d-block font-weight-bold'>Min:</span>
							<span className='d-block'> {`${min} Mbps`}</span>
						</Col>
						<Col xs={4}>
							<span className='d-block font-weight-bold'>Max:</span>
							<span className='d-block'> {`${max} Mbps`}</span>
						</Col>
						<Col xs={4}>
							<span className='d-block font-weight-bold'>Ping:</span>
							<span className='d-block'> {`${ping || '?'} ms`}</span>
						</Col>
					</Row>
				</Col>

				<Col xs={2} className='p-0 d-flex justify-content-center align-items-center' id='testConnectionButton'>
					{
						!isLoading ?
							<div className='text-center rounded-circle' onClick={testNetConnection} >
								<FontAwesomeIcon icon={faTachometerAlt} />
								<div className='text-center'>Test!</div>
							</div> :
							<div className='m-auto'>
								<FontAwesomeIcon icon={faSyncAlt} spin className='d-block' />
							</div>
					}
				</Col>
			</Row>
			<Row className='m-0 p-0 justify-content-center'>
				<Col className='m-0 p-0 justify-content-center'>
					{
						stats.netTestError ? (
							<NetTestError
								// error={stats.netTestErrorStr}
								error={stats.netTestErrorStr}
							/>
						) : (<NetChart data={data} />)
					}

				</Col>
			</Row>
			{
				!lostPackages || (
					<Row className='m-0 p-0'>
						<Col className='m-0 p-0'>
							<div className="text-center bg-warning">Unstable internet connection!</div>
						</Col>
					</Row>
				)
			}
		</Container>
	)
}
