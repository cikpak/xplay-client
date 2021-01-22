import { createContext } from 'react'

const noop = () => {}

export const AuthContext = createContext({
    isAuthenticated: false,
    refreshToken: null,
    userConfig: null,
    userData: null,
    logout: noop,
    login: noop,
    token: null,
})