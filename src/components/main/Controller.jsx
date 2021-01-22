import React, { Component, Fragment } from 'react';
import { setClientConfig, setUserInfo, setApiVersion, updateNetworkConfig } from '../../redux/actions'
import { getRaspberryIp } from '../../services/raspberry'
import { connect } from 'react-redux'
import joinNetwork from '../../services/zerotier'
import { joinTailscaleNetwork } from '../../services/tailscale'
import { exec } from 'child_process'
import ZerotierIdModal from './EditModal.jsx'
import EditModal from './CopyIpModal.jsx'
import axios from 'axios'
import Main from './main.jsx'
import env from '../../env'
const storage = require('electron-json-storage')
const path = storage.getDataPath()


class Controller extends Component {
    constructor(props) {
        super(props)

        this.state = ({
            isLoading: false,
            err: null,
            showModal: false,
            showCopyIp: false,
            readyToPlay: true,
            editParameter: '',
            ip: null
        })

        this.updateRaspberryIp = this.updateRaspberryIp.bind(this)
        this.getRaspberryIp = this.getRaspberryIp.bind(this)
        this.configSaveHandler = this.configSaveHandler.bind(this)
        this.setZerotierIdHandler = this.setZerotierIdHandler.bind(this)
        this.handlePlay = this.handlePlay.bind(this)
        this.getRaspberryVpnIp = this.getRaspberryVpnIp.bind(this)
        this.getClientZerotierIp = this.getClientZerotierIp.bind(this)
        this.showEditModal = this.showEditModal.bind(this)
        this.updateParameterHandler = this.updateParameterHandler.bind(this)
        this.getClientTailscaleIp = this.getClientTailscaleIp.bind(this)
        this.setApiversion = this.setApiversion.bind(this)
        this.getClientVpnIp = this.getClientVpnIp.bind(this)
    }

    handlePlay = async () => {
        const { clientConfig, appConfig } = this.props
        const { network, xboxId, xboxIp } = clientConfig
        const url = appConfig.apiVersion === '1' ? `http://${network.zerotierIp}:8000/play` : `http://${network.tailscaleIp}:8000/v2/play`

        const payload = {
            xbox_id: xboxId,
            xbox_ip: xboxIp,
        }

        payload['src_ip'] = appConfig.apiVersion === '1' ? clientConfig.network.clientZerotierIp : clientConfig.network.clientTailscaleIp
        payload[appConfig.apiVersion === '1' ? 'zerotier_network_id' : 'tailscale_id'] = appConfig.apiVersion === '1' ? clientConfig.network.zerotierId : clientConfig.network.tailscaleId

        console.log('payload :>> ', payload);
        try {
            const response = await axios({
                url,
                method: "POST",
                data: payload,
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200 && response.data.success === true) {
                exec(env.START_CONSOLE_COMPANION)
                this.setState({
                    ip: response.data.rasp_ip,
                    showCopyIp: true,
                })
            }
        } catch (err) {
            console.error(err);
        }
    };

    openCompanionHandler = async () => {
        const result = exec(env.START_CONSOLE_COMPANION)
    }

    configSaveHandler = async () => {
        const { auth, clientConfig } = this.props

        const response = await axios({
            url: env.SAVE_CONFIG_URL,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${auth.tokens.token}`
            },
            data: clientConfig,
        });

        console.log('response :>> ', response);
    }

    setUserConfig = async () => {
        const { auth } = this.props
        window.addEventListener('beforeunload', this.configSaveHandler, false)

        try {
            const url = env.GET_USER_INFO_URL

            const response = await axios({
                url,
                headers: {
                    'Authorization': `Bearer ${auth.tokens.token}`
                },
            })

            const { user } = response.data
            const { clientConfig, ...userInfo } = user
            this.props.setClientConfig(clientConfig)
            this.props.setUserInfo(userInfo)
        } catch (err) {
            this.props.history.push(env.LOGIN_URL)
        }
    }

    updateRaspberryIp = async (error, stdout, stderr) => {
        if (!error) {
            this.props.setClientConfig({ raspberryLocalIp: stdout.replace('\n', '') })
            this.setState({
                ...this.state,
                isLoading: false,
            })
        }
    }

    getRaspberryIp = async () => {
        this.setState({
            ...this.state,
            isLoading: true
        })

        getRaspberryIp(this.updateRaspberryIp)
    }

    setZerotierIdHandler = async (zerotierId) => {
        const { setClientConfig } = this.props

        setClientConfig({
            networkId: zerotierId
        })

        this.setState({ ...this.state, showZerotierModal: false })
    }

    getRaspberryVpnIp = async () => {
        const { clientConfig, appConfig } = this.props
        const { network, raspberryLocalIp } = clientConfig

        const url = appConfig.apiVersion === '1' ? `http://${raspberryLocalIp}:8000/join` : `http://${raspberryLocalIp}:8000/v2/join`
        const data = {}
        data[appConfig.apiVersion === '1' ? 'zerotier_network_id' : 'tailscale_id'] = appConfig.apiVersion === '1' ? network.zerotierId : network.tailscaleId

        const response = await axios({
            url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data,
        })

        if (response.status === 200) {
            const { data } = response

            const config = {}

            config[appConfig.apiVersion === '1' ? 'zerotierIp' : 'tailscaleIp'] = data.rasp_ip

            this.props.updateNetworkConfig(config)
        } else {
            //TODO - toast
            console.log('failed to get raspberry zerotier IP')
        }
    }

    getClientVpnIp = async () => {
        const { clientConfig, appConfig } = this.props

        let config = {}

        if (appConfig.apiVersion === '1') {
            config['clientZerotierIp'] = await joinNetwork(clientConfig.network.zerotierId)
        } else {
            config['clientTailscaleIp'] = joinTailscaleNetwork(clientConfig.network.tailscaleId)
        }

        this.props.updateNetworkConfig(config)
    }

    getXboxIp = async () => {
        const { raspberryLocalIp } = this.props.clientConfig

        const response = await axios({
            url: `http://${raspberryLocalIp}:8000/xbox-ip`,
        })

        if (response.status === 200) {
            const { data } = response

            this.props.setClientConfig({
                xboxIp: data.xbox_ip
            })
        } else {
            //TODO - toast
            console.log('failed to get xbox IP')
        }
    }

    getClientZerotierIp = async () => {
        const { networkId } = this.props.clientConfig
        const zerotierIp = await joinNetwork(networkId)

        this.props.setClientConfig({
            zerotierIp
        })
    }

    getClientTailscaleIp = async () => {
        const { tailscaleId } = this.props.clientConfig
        const tailscaleIp = joinTailscaleNetwork(tailscaleId)

        this.props.setClientConfig({
            tailscaleIp
        })
    }

    showEditModal = (parameter = null) => {
        const editBody = {
            showModal: !this.state.showModal,
        }

        if (parameter) {
            editBody.editParameter = parameter
        }

        this.setState(editBody)
    }

    updateParameterHandler = (value) => {
        console.log('this.state.editParameter :>> ', this.state.editParameter);
        console.log('value :>> ', value);
        const { updateNetworkConfig } = this.props
        const { editParameter } = this.state

        const body = { network: {} }

        body[editParameter] = value

        updateNetworkConfig(body)

        this.setState({
            showModal: false,
            editParameter: null
        })
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.configSaveHandler, false)
        this.setUserConfig()
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.configSaveHandler, false)
    }

    setApiversion = (event) => {
        const newValue = event.target.value

        if (newValue !== this.props.appConfig.apiVersion) {
            this.props.setApiVersion(newValue)
        }

    }

    render() {
        const { auth, userInfo, clientConfig, appConfig } = this.props
        const { showModal, readyToPlay, err, editParameter, showCopyIp, ip } = this.state

        return <Fragment>
            <Main
                auth={auth}
                userInfo={userInfo}
                clientConfig={clientConfig}
                apiVersion={this.props.apiVersion}
                handlePlay={this.handlePlay}
                readyToPlay={readyToPlay && !err}
                getRaspberryIp={this.getRaspberryIp}
                getRaspberryVpnIp={this.getRaspberryVpnIp}
                getXboxIp={this.getXboxIp}
                getClientZerotierIp={this.getClientZerotierIp}
                showEditModal={this.showEditModal}
                openCompanion={this.openCompanionHandler}
                getClientTailscaleIp={this.getClientTailscaleIp}
                setApiVersion={this.setApiversion}
                appConfig={appConfig}
                getClientVpnIp={this.getClientVpnIp}
            />

            <ZerotierIdModal
                show={showModal}
                parameter={editParameter}
                setShow={this.showEditModal}
                updateParameter={this.updateParameterHandler}
            />

            <EditModal
                show={showCopyIp}
                setShow={() => this.setState({ showCopyIp: !showCopyIp })}
                ip={ip}
            />
        </Fragment >
    }
}


const mapStateToProps = (state) => {
    return {
        userInfo: state.userInfo,
        clientConfig: state.clientConfig,
        appConfig: state.appConfig
    }
}

const mapDispatchToProps = {
    setClientConfig,
    setUserInfo,
    setApiVersion,
    updateNetworkConfig
}

export default connect(mapStateToProps, mapDispatchToProps)(Controller)
