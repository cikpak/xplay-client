import React, { Component, Fragment, lazy, Suspense } from 'react';

import { setClientConfig, setUserInfo, setApiVersion, updateNetworkConfig } from '../../redux/actions'
import { joinTailscaleNetwork } from '../../services/tailscale'
import { getRaspberryIp } from '../../services/raspberry'
const path = require('path')
const { clipboard, ipcRenderer } = require('electron')
import { useToasts } from 'react-toast-notifications'
import AboutModal from './AboutModal.jsx'
import { testConnection } from '../../services/iperf'
import { testPing } from '../../services/network'
import joinNetwork from '../../services/zerotier'
import SettingsModal from './SettingsModal.jsx'
import { connect } from 'react-redux'
import { io } from 'socket.io-client'
import { exec } from 'child_process'
const store = require('../../store')
import Main from './main.jsx'
import env from '../../env'
import axios from 'axios'
import EnterZerotierIdModal from './EnterZerotierIdModal.jsx'

// const EnterZerotierIdModal = lazy(() => import('./EnterZerotierIdModal.jsx'))
const EditProfileModal = lazy(() => import('./EditProfileModal.jsx'))

class Controller extends Component {
    constructor(props) {
        super(props)

        this.state = {
            socket: undefined,
            readyToPlay: true,
            isLoading: false,
            showSettings: false,
            showAccount: false,
            showAbout: false,
            err: null,
            update: true,
            whatIsLoading: {
                raspLocalIp: false,
                raspReboot: false,
                clientVpnIp: false,
                raspVpnIp: false,
                netTest: false,
                xboxData: false,
                findXbox: false,
                play: false
            },
            netStats: {
                netTestError: false,
                netTestErrorStr: null,
                data: {},
                min: null,
                max: null,
                ping: null,
                lostPackages: false
            },
            systemStats: {
                xbox: false,
                controller: false,
                raspberry: false,
                network: {
                    wifi: false,
                    ethernet: false
                },
            },
            wizard: {
                enterZerotierId: false,
                enterXboxId: false
            }
        }

        this.checkNetConnectionStatus = this.checkNetConnectionStatus.bind(this)
        this.updateParameterHandler = this.updateParameterHandler.bind(this)
        this.handleRaspberryReboot = this.handleRaspberryReboot.bind(this)
        this.accountUpdateHandler = this.accountUpdateHandler.bind(this)
        this.getClientTailscaleIp = this.getClientTailscaleIp.bind(this)
        this.setZerotierIdHandler = this.setZerotierIdHandler.bind(this)
        this.socketConnectHandler = this.socketConnectHandler.bind(this)
        this.handleSocketRefresh = this.handleSocketRefresh.bind(this)
        this.getClientZerotierIp = this.getClientZerotierIp.bind(this)
        this.autoConfigureClient = this.autoConfigureClient.bind(this)
        this.handleWizardSubmit = this.handleWizardSubmit.bind(this)
        this.getRaspberryVpnIp = this.getRaspberryVpnIp.bind(this)
        this.configSaveHandler = this.configSaveHandler.bind(this)
        this.testNetConnection = this.testNetConnection.bind(this)
        this.tryPowerOnXbox = this.tryPowerOnXbox.bind(this)
        this.getRaspberryIp = this.getRaspberryIp.bind(this)
        this.getClientVpnIp = this.getClientVpnIp.bind(this)
        this.setApiversion = this.setApiversion.bind(this)
        this.setShowWizard = this.setShowWizard.bind(this)
        this.setModalShow = this.setModalShow.bind(this)
        this.setIsLoading = this.setIsLoading.bind(this)
        this.clearClient = this.clearClient.bind(this)
        this.hideAndSeek = this.hideAndSeek.bind(this)
        this.handlePlay = this.handlePlay.bind(this)
        this.showToast = this.showToast.bind(this)
    }

    handlePlay = async () => {
        const { clientConfig, appConfig } = this.props
        const { network, xboxId, xboxIp } = clientConfig
        const url = appConfig.apiVersion === '1' ? `http://${network.zerotierIp}:8000/play` : `http://${network.tailscaleIp}:8000/v2/play`

        const payload = {
            xbox_id: xboxId,
            xbox_ip: xboxIp,
            rasp_local_ip: clientConfig.raspberryLocalIp.replace('\r', '') //TODO - yes, i know
        }

        this.setIsLoading('play', true)

        payload['src_ip'] = appConfig.apiVersion === '1' ? clientConfig.network.clientZerotierIp : clientConfig.network.clientTailscaleIp
        payload['src_ip'] = appConfig.apiVersion === '1' ? clientConfig.network.clientZerotierIp : clientConfig.network.clientTailscaleIp
        payload['rasp_vpn_ip'] = appConfig.apiVersion === '1' ? clientConfig.network.zerotierIp : clientConfig.network.tailscaleIp
        payload[appConfig.apiVersion === '1' ? 'zerotier_network_id' : 'tailscale_id'] = appConfig.apiVersion === '1' ? clientConfig.network.zerotierId : clientConfig.network.tailscaleId

        try {
            axios({
                url,
                method: "POST",
                data: payload,
                headers: { "Content-Type": "application/json" },
            })
                .then(response => {
                    if (response.status === 200 && response.data.success === true) {
                        const { data } = response
                        exec(env.START_CONSOLE_COMPANION)
                        clipboard.writeText(data.rasp_ip)
                        this.setIsLoading('play', false)
                    } else {
                        //TODO  - handle other status than 200
                        console.log('response.status :>> ', response.status);
                        console.log('response.data :>> ', response.data);
                    }
                }).catch(err => {
                    //TODO  - handle err
                    console.log('HUIAC SI NU MERGE PLAY ');
                    console.log('err.response :>> ', err.response);
                    this.setIsLoading('play', false)
                })
        } catch (err) {
            console.error(err);
        }
    };

    openCompanionHandler = async () => {
        const result = exec(env.START_CONSOLE_COMPANION)
    }

    configSaveHandler = () => {
        const { auth, clientConfig, appConfig } = this.props

        store.set({
            'apiVersion': appConfig.apiVersion
        })

        axios({
            url: env.SAVE_CONFIG_URL,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${auth.tokens.token}`
            },
            data: clientConfig,
        })
            .then(response => {
                console.log('response :>> ', response);
                this.setState({ ...this.state, showSettings: false })
            })
    }

    setUserConfig = (callback) => {
        const { auth, setApiVersion, setClientConfig, setUserInfo } = this.props

        setApiVersion(store.get('apiVersion'))
        const url = env.GET_USER_INFO_URL

        axios.get(url, {
            headers: {
                'Authorization': `Bearer ${auth.tokens.token}`
            }
        })
            .then(response => {
                const { user } = response.data
                const { clientConfig, ...userInfo } = user

                setClientConfig(clientConfig)
                console.log('userInfo._id :>> ', userInfo._id);
                setUserInfo(userInfo)
                callback(user, null)
            })
            .catch(err => {
                console.log('HUIAC SI ERROR DIN setUserConfig');
                console.log('err :>> ', err);
                //TODO - logout if response status is 401

                callback(null, err)
            })
    }

    //GET RASPBERRY IP USING CENTRAL API SERVER AND SOCKETS
    getRaspberryIp(callback = null) {
        const { setClientConfig, auth, setUserInfo, user } = this.props
        const { exec } = require("child_process");
        this.setIsLoading('raspLocalIp', true)

        const getRaspberryIpScriptPath = path.resolve('scripts/raspIp.bat');

        try {
            if (user.isClientConfigured) {
                //client olready got the rasp ip in local network and send user id to raspberry
                axios({
                    url: env.GET_RASPBERRY_LOCAL_IP,
                    headers: {
                        'Authorization': `Bearer ${auth.tokens.token}`
                    },
                })
                    .then(response => {
                        setClientConfig({ raspberryLocalIp: response.data.raspberryIp })
                        this.handleSocketRefresh()
                        this.testNetConnection()

                        if (callback) {
                            callback()
                        }

                        this.setIsLoading('raspLocalIp', false)
                    })
                    .catch(err => {
                        console.log('err', err)
                    })
            } else {
                //client is not configured, rasp ip is unknown and raspberry doesn't know user id
                exec(getRaspberryIpScriptPath, (error, stdout, stderr) => {
                    if (!error) {
                        const raspberryLocalIp = stdout.trim()
                        setClientConfig({ raspberryLocalIp })
                        this.handleSocketRefresh()
                        this.testNetConnection()
                        //say hello to raspberry and send user id
                        axios({
                            url: `http://${raspberryLocalIp}:8000/hello`,
                            method: 'POST',
                            data: { userId: user._id }
                        })
                            .then(response => {
                                if (response.status === 200 && response.data.success) {
                                    axios({
                                        url: env.SET_CONFIGURED_CLIENT,
                                        method: 'PUT',
                                        headers: {
                                            'Authorization': `Bearer ${auth.tokens.token}`
                                        }
                                    })
                                        .then(response => {
                                            if (response.status === 200 && response.data.success) {
                                                setUserInfo({ isClientConfigured: true })

                                                if (callback) {
                                                    callback()
                                                }
                                            }
                                            this.setIsLoading('raspLocalIp', false)
                                        }).catch(err => {
                                            this.setIsLoading('raspLocalIp', false)
                                            console.log('err', err)
                                        })
                                } else {
                                    this.setIsLoading('raspLocalIp', false)
                                }
                            })
                            .catch(err => {
                                console.log('err :>> ', err);
                            })
                    } else {
                        this.setIsLoading('raspLocalIp', false)
                    }
                });
            }
        } catch (err) {
            console.log('err :>> ', err);
            this.setIsLoading('raspLocalIp', false)
        }
    }

    setZerotierIdHandler = async (zerotierId) => {
        const { setClientConfig } = this.props

        setClientConfig({
            networkId: zerotierId
        })

        this.setState({ ...this.state, showZerotierModal: false })
    }

    //getRaspberryVpnIp using central server
    getRaspberryVpnIp = async () => {
        this.setIsLoading('raspVpnIp', true)
        const { appConfig, auth, updateNetworkConfig, clientConfig } = this.props
        const currentVpnClient = appConfig.apiVersion === '1' ? 'zerotier' : 'tailscale'
        const networkId = currentVpnClient === 'zerotier' ? clientConfig.network.zerotierId : clientConfig.network.taslcaleId
        let url = `${env.JOIN_NETWORK}${currentVpnClient}`

        axios({
            url,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.tokens.token}`
            },
            data: { networkId }
        })
            .then(response => {
                const { statusText, data } = response
                const { success, msg, ip } = data

                if (statusText === 'OK' && success) {
                    updateNetworkConfig({ [`${currentVpnClient}Ip`]: ip })
                }
            })
            .catch(err => {
                console.log('err :>> ', err);
                this.showToast('error', 'Failed to get raspberry vpn ip!')
            })
            .finally(() => {
                this.setIsLoading('raspVpnIp', false)
            })
    }

    getClientVpnIp = async () => {
        this.setIsLoading('clientVpnIp', true)
        const { clientConfig, appConfig } = this.props
        let config = {}

        if (appConfig.apiVersion === '1') {
            config['clientZerotierIp'] = await joinNetwork(clientConfig.network.zerotierId)
        } else {
            config['clientTailscaleIp'] = await joinTailscaleNetwork(clientConfig.network.tailscaleId)
        }

        this.setIsLoading('clientVpnIp', false)
        this.props.updateNetworkConfig(config)
    }

    getXboxData = async () => {
        const { auth, setClientConfig } = this.props
        this.setIsLoading('xboxData', true)

        try {
            axios({
                url: env.GET_XBOX_DATA,
                headers: {
                    'Authorization': `Bearer ${auth.tokens.token}`
                }
            })
                .then(response => {
                    console.log('response :>> ', response);
                    if (response.status === 200 && response.data.success) {
                        const { data } = response

                        this.props.setClientConfig({
                            xboxIp: data.xboxIp,
                            xboxId: data.xboxId
                        })
                    }
                })
                .catch(err => console.log('err', err))
                .finally(() => {
                    this.setIsLoading('xboxData', false)
                })
        } catch (error) {
            console.log('error :>> ', error);
            this.setIsLoading('xboxData', false)
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
        this.setState({
            ...this.state,
            whatIsLoading: {
                ...this.state.whatIsLoading,
                clientVpnIp: true
            }
        })
        const { tailscaleId } = this.props.clientConfig

        try {
            const tailscaleIp = joinTailscaleNetwork(tailscaleId)

            this.props.setClientConfig({
                tailscaleIp
            })

            this.setState({
                ...this.state,
                whatIsLoading: {
                    ...this.state.whatIsLoading,
                    clientVpnIp: false
                }
            })
        } catch (error) {
            this.props.setClientConfig({
                tailscaleIp: 'failed'
            })

            this.setState({
                ...this.state,
                whatIsLoading: {
                    ...this.state.whatIsLoading,
                    clientVpnIp: false
                }
            })
        }
    }

    updateParameterHandler = (value) => {
        const { updateNetworkConfig } = this.props
        const { editParameter } = this.state

        const body = { [editParameter]: value }

        if (editParameter === 'xboxId') return setClientConfig({ [editParameter]: value })

        updateNetworkConfig(body)
        this.setState({
            showModal: false,
            editParameter: null
        })
    }

    checkNetConnectionStatus() {
        const { wifi, ethernet } = this.state.systemStats.network
        const netConnectionStats = ipcRenderer.sendSync('get-network-config')

        if (netConnectionStats.wifi !== wifi || netConnectionStats.ethernet !== ethernet) {

            this.setState({
                ...this.state,
                systemStats: {
                    ...this.state.systemStats,
                    network: netConnectionStats
                }
            })
        }

    }

    socketConnectHandler(raspberryIp, newSocket = false) {
        const { setClientConfig } = this.props
        if (newSocket) {
            console.log('new socket, killing old socket');
            if (this.state.socket) {
                this.state.socket.disconnect()
            }
        }

        try {
            const socket = io.connect(`http://${raspberryIp}:8000`, {
                forceNew: true,
                reconnection: true,
                reconnectionDelay: 3000,
                reconnectionAttempts: 100,
                forceNew: true
            })

            this.setState({ ...this.state, socket })

            socket.on('connect', () => {
                console.log('connect :>> ');
                this.setState({
                    ...this.state,
                    whatIsLoading: {
                        ...this.state.whatIsLoading,
                        raspReboot: false
                    },
                    systemStats: {
                        ...this.state.systemStats,
                        raspberry: true
                    }
                })
            })

            socket.on('reconnect', () => {
                console.log('reconnect :>> ', reconnect);
                this.setState({
                    ...this.state,
                    whatIsLoading: {
                        ...this.state.whatIsLoading,
                        raspReboot: false
                    },
                    systemStats: {
                        ...this.state.systemStats,
                        raspberry: true
                    }
                })
            })

            socket.io.on("reconnection_attempt", () => {
                console.log('reconnection_attempt');
            });

            socket.io.on("reconnect", () => {
                console.log('reconnect');
            });

            socket.on("connect_error", () => {
                console.log('connection error');
            });

            socket.on('disconnect', () => {
                console.log('disconnected')

                this.setState({
                    ...this.state,
                    systemStats: {
                        ...this.state.systemStats,
                        raspberry: false
                    }
                })
            })

            socket.on('xbox find finish', (data) => {
                const { success, msg } = data

                this.showToast(success ? 'success' : 'error', msg)

                if (success) setClientConfig({ ...data })
                this.setIsLoading('findXbox', false)
            })
        } catch (error) {
            this.showToast('error', 'Websocket error!')
        }
    }

    componentWillMount() {
        window.addEventListener('beforeunload', this.configSaveHandler, false)
        const netConnectionStats = ipcRenderer.sendSync('get-network-config')

        this.setUserConfig((user, err) => {
            const { clientConfig } = user

            let raspberryIp = clientConfig.raspberryLocalIp

            if (this.props.appConfig.apiVersion === '1' && clientConfig.network.zerotierIp) {
                raspberryIp = clientConfig.network.zerotierIp
            } else if (this.props.appConfig.apiVersion === '2' && clientConfig.network.tailscaleIp) {
                raspberryIp = clientConfig.network.tailscaleIp
            }

            if (raspberryIp) {
                this.socketConnectHandler(raspberryIp)
            }

            const netInfo = store.get('netTest')

            this.setState({
                ...this.state,
                systemStats: {
                    ...this.state.systemStats,
                    network: {
                        wifi: netConnectionStats.wifi,
                        ethernet: netConnectionStats.ethernet
                    },
                },
                netStats: {
                    ...this.state.netStats,
                    netTestError: netInfo.netTestError || false,
                    netTestErrorStr: netInfo.netTestErrorStr || null,
                    data: netInfo.data || {},
                    min: netInfo.min || null,
                    max: netInfo.max || null,
                    ping: netInfo.ping || null,
                }
            })
        })

        setInterval(this.checkNetConnectionStatus, 5000)
    }

    componentWillUnmount() {
        if (this.state.socket) {
            this.state.socket.disconnect()
        }

        window.removeEventListener('beforeunload', this.configSaveHandler, false)
    }

    componentDidMount() {
        if (!this.props.userInfo.isClientConfigured) {
            this.setState({ ...this.state, showSettings: true })
        }
    }

    setApiversion = (event) => {
        const newValue = event.target.value

        if (newValue !== this.props.appConfig.apiVersion) {
            this.props.setApiVersion(newValue)
        }
    }

    setIsLoading(parameter, isLoading) {
        this.setState({
            ...this.state,
            whatIsLoading: {
                ...this.state.whatIsLoading,
                [parameter]: isLoading
            }
        })
    }

    showToast(toastType, message) {
        const toast = this.props.toast
        console.log(`${toastType} :>>>> ${message}`);

        toast.addToast(message, {
            appearance: toastType,
            placement: 'top-left',
            transition: 'exiting',
            autoDismiss: true,
            autoDismissTimeout: 2000
        })
    }

    testNetConnection = () => {
        this.setIsLoading('netTest', true)
        const { appConfig, clientConfig } = this.props
        const { network, raspberryLocalIp } = clientConfig
        const { zerotierIp, tailscaleIp } = network
        let raspIp = null

        try {
            if (zerotierIp || tailscaleIp) {
                if (appConfig.apiVersion === "1") {
                    if (zerotierIp) {
                        raspIp = zerotierIp
                    } else {
                        throw 'vpn client is zerotier but rasp zerotier ip is missing'
                    }
                } else if (appConfig.apiVersion === "2") {
                    if (tailscaleIp) {
                        raspIp = tailscaleIp
                    } else {
                        throw 'vpn client is tailscale but rasp tailscale ip is missing'
                    }
                }
            } else if (raspberryLocalIp) {
                raspIp = raspberryLocalIp
            } else {
                throw 'client neconfigurat'
            }

            if (raspIp) {
                testConnection(raspIp, async (result, err) => {
                    if (!err) {
                        const { host, ticks, lostPackages } = result

                        //get only speed from test ticks
                        const values = ticks.map(obj => obj.speed)

                        //get min max from test
                        const min = Math.min.apply(null, values)
                        const max = Math.max.apply(null, values)

                        const pingResult = await testPing(host)

                        //update speed test info in local electron store
                        store.set('netTest', {
                            data: ticks,
                            ping: pingResult.avg.split('.')[0],
                            min: min || 0,
                            max: max || 0,
                        })

                        this.setState({
                            ...this.state,
                            netStats: {
                                netTestError: false,
                                ping: pingResult.avg.split('.')[0],
                                min: min || 0,
                                max: max || 0,
                                data: ticks,
                                lostPackages,
                            },
                            whatIsLoading: {
                                ...this.state.whatIsLoading,
                                netTest: false
                            }
                        })
                    } else {
                        console.log('error la net test:>> ', err);

                        //TODO - fix this shit and blood from eyes

                        store.set('netTest', {
                            netTestError: true,
                            netTestErrorStr: err,
                            lostPackages: true,
                            ping: null,
                            data: [],
                            min: 0,
                            max: 0,
                        })

                        this.setState({
                            ...this.state,
                            netStats: {
                                netTestError: true,
                                netTestErrorStr: err,
                                lostPackages: false,
                                ping: null,
                                data: [],
                                min: 0,
                                max: 0,
                            },
                            whatIsLoading: {
                                ...this.state.whatIsLoading,
                                netTest: false
                            }
                        })

                        this.showToast('error', err)
                    }
                })
            }
        } catch (error) {  //handle net test errors and set it to state, local storage
            store.set('netTest', {
                netTestError: true,
                netTestErrorStr: error,
                lostPackages: true,
                ping: null,
                data: [],
                min: 0,
                max: 0,
            })

            this.setState({
                ...this.state,
                netStats: {
                    netTestError: true,
                    netTestErrorStr: error,
                    lostPackages: false,
                    ping: null,
                    data: [],
                    min: 0,
                    max: 0,
                },
                whatIsLoading: {
                    ...this.state.whatIsLoading,
                    netTest: false
                }
            })

            this.showToast('error', error)
        }
    }

    accountUpdateHandler = (values) => {
        const { auth, setUserInfo } = this.props
        let form = new FormData()

        Object.keys(values).map(field => form.append(field, values[field]))

        axios({
            url: env.UPDATE_ACCOUNT_URL,
            method: 'PUT',
            data: form,
            headers: {
                'Authorization': `Bearer ${auth.tokens.token}`,
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((response) => {
                //TODO - toast
                if (response.status === 200) {
                    setUserInfo(response.data)
                    this.setState({
                        ...this.state,
                        showAccount: false
                    })
                } else if (response.status === 401) {
                    console.log('logout');
                } else {
                    console.log('alt status code : response.status :>> ', response.status);
                }
            })
            .catch(err => {
                console.log('err :>> ', err);
            })
    }

    handleRaspberryReboot() {
        const { auth } = this.props

        axios({
            url: env.REBOOT_RASPBERRY,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.tokens.token}`
            }
        })
            .then(response => {
                console.log('response :>> ', response);
                this.setIsLoading('raspReboot', true)
            })
            .catch(err => {
                console.log('err :>> ', err);

                if (err.response) {
                    const { response } = err
                    console.log('response :>> ', response);
                    this.showToast(error, 'Failed to reboot raspberry!')
                }
            })
    }

    handleSocketRefresh() {
        const { clientConfig } = this.props
        let raspberryIp = clientConfig.raspberryLocalIp

        if (this.props.appConfig.apiVersion === '1' && clientConfig.network.zerotierIp) {
            raspberryIp = clientConfig.network.zerotierIp
        } else if (this.props.appConfig.apiVersion === '2' && clientConfig.network.tailscaleIp) {
            raspberryIp = clientConfig.network.tailscaleIp
        }

        this.socketConnectHandler(raspberryIp, true)
    }

    setShowWizard(parameter) {
        this.setState({
            ...this.state, wizard: {
                ...this.state.wizard,
                [parameter]: !this.state.wizard[parameter]
            }
        })
    }

    setModalShow(parameter) {
        this.setState({
            ...this.state,
            [parameter]: !this.state[parameter]
        })
    }

    //auto configure client
    autoConfigureClient(vpnNetworkId = null) {
        //TODO - fix bug with null vpn ID after wizard hide and recall auto config
        const { clientConfig, auth, updateNetworkConfig } = this.props
        const { network, raspberryLocalIp, isClientConfigured, xboxIp, xboxId } = clientConfig
        const { zerotierIp, zerotierId, tailscaleIp, tailscaleId, clientZerotierIp, clientTailscaleIp } = network

        if (vpnNetworkId) {
            updateNetworkConfig({ zerotierId: vpnNetworkId })
        }

        if (!zerotierId && !vpnNetworkId) {
            console.log('nu e setat zerotier id, se cere')
            //please client to enter zerotier id and get client and raspberry zerotier ip
            this.setState((state, props) => {
                return {
                    ...state,
                    showSettings: false,
                    wizard: {
                        ...state.wizard,
                        enterZerotierId: true
                    }
                }
            })
        } else {
            console.log('zerotier id setat, se verifica daca este ip pentru client si rasp');
            this.setState((state, props) => {
                console.log('state :>> ', state);
                return {
                    ...state,
                    showSettings: true,
                    wizard: {
                        ...state.wizard,
                        enterZerotierId: false
                    }
                }
            })
            if (!raspberryLocalIp) {
                this.getRaspberryIp(() => {
                    if (!zerotierIp) {
                        console.log('nu este setat zerotier ip, se cere');
                        this.getRaspberryVpnIp()
                    }

                    if (!clientZerotierIp) {
                        console.log('nu este setat client zerotier ip, se cere');
                        this.getClientVpnIp()
                    }

                    if (!xboxIp) {
                        console.log('nu este setat xbox ip, se cere de la rasp');
                        this.getXboxData()
                    }
                })
            } else {
                console.log('este local rasp ip')
                if (!zerotierIp) {
                    console.log('nu este setat zerotier ip, se cere');
                    this.getRaspberryVpnIp()
                }

                if (!clientZerotierIp) {
                    console.log('nu este setat client zerotier ip, se cere');
                    this.getClientVpnIp()
                }

                if (!xboxIp || !xboxId) {
                    console.log('nu este setat xbox ip, se cere de la rasp');
                    this.getXboxData()
                }
            }
        }
    }

    hideAndSeek() {
        this.setState((state, props) => {
            const newState = {
                ...state,
                showSettings: true,
                wizard: {
                    ...state.wizard,
                    enterZerotierId: false
                }
            }
            return newState
        })
    }

    handleWizardSubmit(fields) {
        this.autoConfigureClient(fields.zerotierId)
        this.hideAndSeek()
    }

    clearClient() {
        const { auth } = this.props

        axios({
            url: env.SAVE_CONFIG_URL,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${auth.tokens.token}`
            },
            data: {
                "network": {
                    "tailscaleId": null,
                    "zerotierId": null,
                    "zerotierIp": null,
                    "tailscaleIp": null,
                    "clientZerotierIp": null,
                    "clientTailscaleIp": null
                },
                "xboxId": null,
                "xboxIp": null,
                "raspberryLocalIp": null
            },
        }).then(response => {
            console.log(`response`, response)
        })
    }

    tryPowerOnXbox() {
        this.setIsLoading('findXbox', true)
        const { auth } = this.props

        axios({
            url: env.TRY_POWER_ON_XBOX,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.tokens.token}`
            },
        })
            .then(response => {
                if (response.data.success === true) {
                    this.showToast('success', response.data.msg)
                } else {
                    this.showToast('error', response.data.msg)
                }
            })
            .catch(err => {
                console.log(`err`, err)
                this.showToast('error', 'Failed to find xbox!')
            })
    }


    render() {
        const { netStats, showSettings, showAbout, whatIsLoading, systemStats, showAccount, wizard } = this.state
        const { auth, userInfo, clientConfig, appConfig, setClientConfig, updateNetworkConfig, user } = this.props

        return <Fragment>
            <EnterZerotierIdModal
                show={this.state.wizard.enterZerotierId}
                setShow={this.setShowWizard}
                setShowModal={this.setModalShow}
                updateNetworkConfig={updateNetworkConfig}
                handleWizardSubmit={this.handleWizardSubmit}
            />

            < Main
                showAboutModal={() => this.setState({ ...this.state, showAbout: !this.state.showAbout })}
                showSettingsModal={() => this.setState({ ...this.state, showSettings: !showSettings })}
                showAccountModal={() => this.setState({ ...this.state, showAccount: !showAccount })}
                handleRaspberryReboot={this.handleRaspberryReboot}
                handleSocketRefresh={this.handleSocketRefresh}
                testNetConnection={this.testNetConnection}
                tryPowerOnXbox={this.tryPowerOnXbox}
                whatIsLoading={whatIsLoading}
                handlePlay={this.handlePlay}
                systemStats={systemStats}
                appConfig={appConfig}
                data={netStats.data}
                userInfo={userInfo}
                stats={netStats}
                auth={auth}
                user={user}
            />

            <AboutModal
                show={showAbout}
                setShow={() => this.setState({ ...this.state, showAbout: !this.state.showAbout })}
            />

            <SettingsModal
                setShow={() => this.setState({ ...this.state, showSettings: !showSettings })}
                getClientZerotierIp={this.getClientZerotierIp}
                autoConfigureClient={this.autoConfigureClient}
                configSaveHandler={this.configSaveHandler}
                getRaspberryVpnIp={this.getRaspberryVpnIp}
                updateNetworkConfig={updateNetworkConfig}
                getClientVpnIp={this.getClientVpnIp}
                getRaspberryIp={this.getRaspberryIp}
                setApiVersion={this.setApiversion}
                showEditModal={this.showEditModal}
                setClientConfig={setClientConfig}
                clearClient={this.clearClient}
                whatIsLoading={whatIsLoading}
                clientConfig={clientConfig}
                getXboxIp={this.getXboxData}
                appConfig={appConfig}
                show={showSettings}
                userInfo={userInfo}
                user={user}
            />

            <Suspense fallback={<Fragment />}>
                <EditProfileModal
                    setShow={() => this.setState({ ...this.state, showAccount: !showAccount })}
                    accountUpdateHandler={this.accountUpdateHandler}
                    show={showAccount}
                    user={user}
                />
            </Suspense>
        </Fragment >
    }
}

const mapStateToProps = (state) => {
    return {
        clientConfig: state.clientConfig,
        user: state.userInfo,
        appConfig: state.appConfig,
        userInfo: state.userInfo,
    }
}

const mapDispatchToProps = {
    updateNetworkConfig,
    setClientConfig,
    setApiVersion,
    setUserInfo,
}

const withToasts = (props) => {
    const toast = useToasts()
    return (
        <Controller {...props} toast={toast} />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withToasts)
