import React, { Component } from 'react';
import Register from './Register.jsx'
import RegisterSuccess from './RegisterSuccess.jsx'
import axios from 'axios'
import env from '../../env'
import './style.scss'
import { withToastManager } from 'react-toast-notifications'

class RegisterController extends Component {
    constructor(props) {
        super(props)

        this.state = {
            registrationSuccess: false,
            form: {},
            err: null
        }

        this.registerHandler = this.registerHandler.bind(this)
        this.fieldChangeHandler = this.fieldChangeHandler.bind(this)
    }

    registerHandler = async (event) => {
        event.preventDefault()
        const { toastManager } = this.props

        try {

            const response = await axios({
                url: env.REGISTER_URL,
                method: 'POST',
                data: this.state.form,
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.status === 201) {
                toastManager.add(response.data.msg, {
                    appearance: 'success',
                    autoDismiss: true,
                })

                this.setState({
                    ...this.state,
                    registrationSuccess: true
                })
            }
        } catch (err) {
            const response = err.response
            toastManager.add(response.data.msg, {
                appearance: 'error',
                autoDismiss: true,
            })
        }
        //TODO - show that user has been created
    }

    fieldChangeHandler = (event) => {
        this.setState({
            ...this.state,
            form: {
                ...this.state.form,
                [event.target.name]: event.target.value
            }
        })
    }

    render() {
        const { registrationSuccess } = this.state

        return (registrationSuccess ? <RegisterSuccess /> :
            <Register
                registerHandler={this.registerHandler}
                fieldChangeHandler={this.fieldChangeHandler}
                err={this.state.err}
            />
        )
    }
}


export default withToastManager(RegisterController)
