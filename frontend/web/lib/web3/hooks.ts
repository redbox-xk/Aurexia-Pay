'use client'

import { useState, useEffect } from 'react'
import { BrowserProvider, formatEther } from 'ethers'

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    checkConnection()
    
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('disconnect', handleDisconnect)

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
        ethereum.removeListener('chainChanged', handleChainChanged)
        ethereum.removeListener('disconnect', handleDisconnect)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return
    
    try {
      const provider = new BrowserProvider((window as any).ethereum)
      const accounts = await provider.listAccounts()
      
      if (accounts.length > 0) {
        const address = accounts[0].address
        setAccount(address)
        setIsConnected(true)
        await updateBalance(provider, address)
        
        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))
      }
    } catch (error) {
      console.error('[v0] Failed to check connection:', error)
    }
  }

  const updateBalance = async (provider: BrowserProvider, address: string) => {
    try {
      const balanceWei = await provider.getBalance(address)
      const balanceEth = formatEther(balanceWei)
      setBalance(balanceEth)
    } catch (error) {
      console.error('[v0] Failed to get balance:', error)
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
      
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new BrowserProvider((window as any).ethereum)
        await updateBalance(provider, accounts[0])
      }
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
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('Please install MetaMask or another Web3 wallet')
      return false
    }

    setIsConnecting(true)
    try {
      const ethereum = (window as any).ethereum
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        
        const provider = new BrowserProvider(ethereum)
        await updateBalance(provider, accounts[0])
        
        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))
        
        localStorage.setItem('walletConnected', 'true')
        return true
      }
      return false
    } catch (error) {
      console.error('[v0] Error connecting wallet:', error)
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setIsConnected(false)
    setBalance('0')
    setChainId(null)
    localStorage.removeItem('walletConnected')
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
