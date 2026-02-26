import { useState, useEffect } from 'react'
import { web3Client } from './client'

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    checkConnection()
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('disconnect', handleDisconnect)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('disconnect', handleDisconnect)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      const accounts = await web3Client.getAccount()
      if (accounts) {
        setAccount(accounts)
        setIsConnected(true)
        await updateBalance(accounts)
      }
    } catch (error) {
      console.error('Failed to check connection:', error)
    }
  }

  const updateBalance = async (address: string) => {
    try {
      const bal = await web3Client.getBalance(address)
      setBalance(bal)
    } catch (error) {
      console.error('Failed to get balance:', error)
    }
  }

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null)
      setIsConnected(false)
      setBalance('0')
    } else {
      setAccount(accounts[0])
      setIsConnected(true)
      await updateBalance(accounts[0])
    }
  }

  const handleChainChanged = (chainIdHex: string) => {
    setChainId(parseInt(chainIdHex, 16))
  }

  const handleDisconnect = () => {
    setAccount(null)
    setIsConnected(false)
    setBalance('0')
  }

  const connect = async () => {
    setIsConnecting(true)
    try {
      const success = await web3Client.connect()
      if (success) {
        const acc = await web3Client.getAccount()
        setAccount(acc)
        setIsConnected(true)
        if (acc) await updateBalance(acc)
      }
      return success
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    await web3Client.disconnect()
    setAccount(null)
    setIsConnected(false)
    setBalance('0')
  }

  return {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
  }
}
