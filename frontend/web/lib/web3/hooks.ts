import { useState, useEffect, useCallback } from 'react'

export interface PaymentTransaction {
  hash: string
  from: string
  to: string
  amount: string
  status: 'pending' | 'confirmed' | 'failed'
  gasUsed?: number
  timestamp: number
}

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])

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

  const checkConnection = useCallback(async () => {
    try {
      if (!window.ethereum) return
      
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      }) as string[]
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        await updateBalance(accounts[0])
      }
    } catch (error) {
      console.error('Failed to check connection:', error)
    }
  }, [])

  const updateBalance = useCallback(async (address: string) => {
    try {
      if (!window.ethereum) return
      
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }) as string
      
      const balanceWei = BigInt(balanceHex)
      const balanceEth = (balanceWei / BigInt(10 ** 18)).toString()
      setBalance(balanceEth)
    } catch (error) {
      console.error('Failed to get balance:', error)
    }
  }, [])

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null)
      setIsConnected(false)
      setBalance('0')
    } else {
      setAccount(accounts[0])
      setIsConnected(true)
      await updateBalance(accounts[0])
    }
  }, [updateBalance])

  const handleChainChanged = useCallback((chainIdHex: string) => {
    setChainId(parseInt(chainIdHex, 16))
  }, [])

  const handleDisconnect = useCallback(() => {
    setAccount(null)
    setIsConnected(false)
    setBalance('0')
  }, [])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed')
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[]

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        await updateBalance(accounts[0])
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to connect:', error)
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [updateBalance])

  const disconnect = useCallback(async () => {
    setAccount(null)
    setIsConnected(false)
    setBalance('0')
    setTransactions([])
  }, [])

  const sendTransaction = useCallback(async (to: string, amount: string) => {
    try {
      if (!account || !window.ethereum) {
        throw new Error('Wallet not connected')
      }

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to,
            value: (BigInt(amount) * BigInt(10 ** 18)).toString(16),
          },
        ],
      }) as string

      const tx: PaymentTransaction = {
        hash: txHash,
        from: account,
        to,
        amount,
        status: 'pending',
        timestamp: Date.now(),
      }

      setTransactions((prev) => [tx, ...prev])
      return txHash
    } catch (error) {
      console.error('Failed to send transaction:', error)
      throw error
    }
  }, [account])

  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed')
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, handle separately
        throw new Error('Chain not found in wallet')
      }
      throw error
    }
  }, [])

  return {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    transactions,
    connect,
    disconnect,
    sendTransaction,
    switchNetwork,
  }
}

export function usePaymentFlow() {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const web3 = useWeb3()

  const processPayment = useCallback(async (paymentId: string, recipientAddress: string, amount: string) => {
    try {
      setPaymentStatus('processing')
      setPaymentError(null)

      // Send transaction
      const txHash = await web3.sendTransaction(recipientAddress, amount)

      // Confirm payment with backend
      const response = await fetch(`/api/v1/payments/${paymentId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payer_address: web3.account,
          transaction_hash: txHash,
        }),
      })

      if (!response.ok) {
        throw new Error('Payment confirmation failed')
      }

      setPaymentStatus('success')
      return txHash
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setPaymentError(message)
      setPaymentStatus('error')
      throw error
    }
  }, [web3])

  return {
    paymentStatus,
    paymentError,
    processPayment,
  }
}
