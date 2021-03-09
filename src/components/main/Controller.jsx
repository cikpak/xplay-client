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

const EditProfileModal = lazy(() => import('./EditProfileModal.jsx'))

class Controller extends Component {
    constructor(props) {
        super(props)

        this.state = {
            readyToPlay: true,
            isLoading: false,
            showSettings: false,
            showAccount: false,
            showAbout: false,
            err: null,
            whatIsLoading: {
                raspLocalIp: false,
                clientVpnIp: false,
                raspVpnIp: false,
                netTest: false,
                xboxIp: false
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
            }
        }

        this.checkNetConnectionStatus = this.checkNetConnectionStatus.bind(this)
        this.updateParameterHandler = this.updateParameterHandler.bind(this)
        this.accountUpdateHandler = this.accountUpdateHandler.bind(this)
        this.getClientTailscaleIp = this.getClientTailscaleIp.bind(this)
        this.setZerotierIdHandler = this.setZerotierIdHandler.bind(this)
        this.socketConnectHandler = this.socketConnectHandler.bind(this)
        this.getClientZerotierIp = this.getClientZerotierIp.bind(this)
        this.getRaspberryVpnIp = this.getRaspberryVpnIp.bind(this)
        this.configSaveHandler = this.configSaveHandler.bind(this)
        this.testNetConnection = this.testNetConnection.bind(this)
        this.getRaspberryIp = this.getRaspberryIp.bind(this)
        this.getClientVpnIp = this.getClientVpnIp.bind(this)
        this.setApiversion = this.setApiversion.bind(this)
        this.setIsLoading = this.setIsLoading.bind(this)
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
                    } else {
                        //TODO  - handle other status than 200
                        console.log('response.status :>> ', response.status);
                        console.log('response.data :>> ', response.data);
                    }
                }).catch(err => {
                    //TODO  - handle err
                    console.log('HUIAC SI NU MERGE PLAY ');
                    console.log('err.response :>> ', err.response);
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
    getRaspberryIp() {
        const { setClientConfig, auth, setUserInfo, user } = this.props
        const { exec } = require("child_process");
        this.setIsLoading('raspLocalIp', true)
        const getRaspberryIpScriptPath = path.resolve('scripts/raspIp.bat');

        try {
            if (user.isClientConfigured) {
                //client olready got the rasp ip in local network and send user id to raspberry
                axios({
                    url: `${env.API_BASE_URL}/raspberry/local-ip`,
                    headers: {
                        'Authorization': `Bearer ${auth.tokens.token}`
                    }
                })
                    .then(response => {
                        setClientConfig({ raspberryLocalIp: response.data.raspberryIp })
                        this.setIsLoading('raspLocalIp', false)
                    })
                    .catch(err => {
                        console.log('err', err)
                        this.setIsLoading('raspLocalIp', false)
                    })

            } else {
                //client is not configured, rasp ip is unknown and raspberry doesn't know user id
                exec(getRaspberryIpScriptPath, (error, stdout, stderr) => {
                    if (!error) {
                        const raspberryLocalIp = stdout.trim()
                        setClientConfig({ raspberryLocalIp })

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
                                                this.setIsLoading('raspLocalIp', false)
                                            } else {
                                                console.log('Failed to set client as configured in database')
                                            }
                                        }).catch(err => {
                                            console.log('err', err)
                                        })
                                }
                            })
                            .catch(err => {
                                console.log('err :>> ', err);
                                this.setIsLoading('raspLocalIp', false)
                            })
                    } else {
                        console.log('get raspberry ip fail ');
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

    //getRaspberryVpnIp using direct connection
    // getRaspberryVpnIp = async () => {
    //     const { clientConfig, appConfig } = this.props
    //     const { network, raspberryLocalIp } = clientConfig
    //     this.setIsLoading('raspVpnIp', true)

    //     let url = ''

    //     if (network.tailscaleIp || network.zerotierIp) {
    //         if (network.tailscaleId) {
    //             url = `http://${network.tailscaleIp || network.zerotierIp}:8000/v2/join`
    //         } else {
    //             url = `http://${network.tailscaleIp || network.zerotierIp}:8000/join`
    //         }
    //     } else if (raspberryLocalIp) {
    //         url = `http://${raspberryLocalIp}:8000/join`
    //     } else {
    //         this.showToast('error', 'n-ai cum, nu e configurat nici un ip')
    //     }

    //     const data = {}
    //     data[appConfig.apiVersion === '1' ? 'zerotier_network_id' : 'tailscale_id'] = appConfig.apiVersion === '1' ? network.zerotierId : network.tailscaleId

    //     axios({
    //         url,
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         data,
    //     })
    //         .then(response => {
    //             console.log('response :>> ', response);
    //             if (response.status === 200) {
    //                 const { data } = response
    //                 this.props.updateNetworkConfig({ [appConfig.apiVersion === '1' ? 'zerotierIp' : 'tailscaleIp']: data.rasp_ip })
    //             } else {
    //                 this.showToast('error', 'HELLO DIN ELSE, CEVA NU A MERS BINE :( ');
    //             }
    //         })
    //         .catch(err => this.showToast('error', 'Failed to get raspberry vpn ip!'))
    //         .finally(() => {
    //             this.setIsLoading('raspVpnIp', false)
    //         })
    // }


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

    //GET XBOX IP USING DIRRECT CONNECTION
    // getXboxIp = async () => {
    //     const { raspberryLocalIp, network } = this.props.clientConfig
    //     this.setIsLoading('xboxIp', true)

    //     try {
    //         let url = ''
    //         if (network.tailscaleIp || network.zerotierIp) {
    //             url = `http://${network.tailscaleIp || network.zerotierIp}:8000/xbox-ip`
    //         } else if (raspberryLocalIp) {
    //             url = `http://${raspberryLocalIp}:8000/xbox-ip`
    //         } else {
    //             this.showToast('error', 'n-ai cum, nu e configurat nici un ip')
    //         }

    //         axios({ url })
    //             .then(response => {
    //                 if (response.status === 200) {
    //                     const { data } = response
    //                     this.props.setClientConfig({
    //                         xboxIp: data.xbox_ip
    //                     })
    //                 }
    //             })
    //             .catch(err => console.log('err', err))
    //             .finally(() => {
    //                 this.setIsLoading('xboxIp', false)
    //             })
    //     } catch (error) {
    //         console.log('error :>> ', error);
    //         this.setIsLoading('xboxIp', false)
    //     }
    // }

    getXboxIp = async () => {
        const { auth } = this.props
        this.setIsLoading('xboxIp', true)

        try {
            axios({
                url: `${env.API_BASE_URL}/console/ip`, headers: {
                    'Authorization': `Bearer ${auth.tokens.token}`
                }
            })
                .then(response => {
                    console.log('response :>> ', response);
                    if (response.status === 200 && response.data.success) {
                        const { data } = response

                        this.props.setClientConfig({
                            xboxIp: data.xboxIp
                        })
                    }
                })
                .catch(err => console.log('err', err))
                .finally(() => {
                    this.setIsLoading('xboxIp', false)
                })
        } catch (error) {
            console.log('error :>> ', error);
            this.setIsLoading('xboxIp', false)
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

    socketConnectHandler(raspberryIp) {
        const socket = io.connect(`http://${raspberryIp}:8000`, {
            reconnect: true,
            timeout: 1
        })

        socket.on('connect', () => {
            this.setState({
                ...this.state,
                systemStats: {
                    ...this.state.systemStats,
                    raspberry: true
                }
            })
        })

        socket.on('reconnect', () => {
            this.setState({
                ...this.state,
                systemStats: {
                    ...this.state.systemStats,
                    raspberry: true
                }
            })
        })

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
        window.removeEventListener('beforeunload', this.configSaveHandler, false)
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

    render() {
        const { netStats, showSettings, showAbout, whatIsLoading, systemStats, showAccount } = this.state
        const { auth, clientConfig, appConfig, setClientConfig, updateNetworkConfig, user } = this.props

        return <Fragment>
            < Main
                showSettingsModal={() => this.setState({ ...this.state, showSettings: !showSettings })}
                showAccountModal={() => this.setState({ ...this.state, showAccount: !showAccount })}
                showAboutModal={() => this.setState({ ...this.state, showAbout: !this.state.showAbout })}
                testNetConnection={this.testNetConnection}
                whatIsLoading={whatIsLoading}
                handlePlay={this.handlePlay}
                systemStats={systemStats}
                appConfig={appConfig}
                data={netStats.data}
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
                getRaspberryVpnIp={this.getRaspberryVpnIp}
                configSaveHandler={this.configSaveHandler}
                updateNetworkConfig={updateNetworkConfig}
                getClientVpnIp={this.getClientVpnIp}
                getRaspberryIp={this.getRaspberryIp}
                setApiVersion={this.setApiversion}
                showEditModal={this.showEditModal}
                setClientConfig={setClientConfig}
                whatIsLoading={whatIsLoading}
                clientConfig={clientConfig}
                getXboxIp={this.getXboxIp}
                user={user}
                appConfig={appConfig}
                show={showSettings}
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
