import { ethers } from 'ethers'

export class Web3Client {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  async connect(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No Web3 provider found')
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum)
      await this.provider.send('eth_requestAccounts', [])
      this.signer = await this.provider.getSigner()
      return true
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null
    this.signer = null
  }

  async getAccount(): Promise<string | null> {
    if (!this.signer) return null
    return await this.signer.getAddress()
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) return '0'
    const balance = await this.provider.getBalance(address)
    return ethers.formatEther(balance)
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) throw new Error('No signer available')
    return await this.signer.signMessage(message)
  }

  async sendTransaction(to: string, value: string): Promise<any> {
    if (!this.signer) throw new Error('No signer available')
    
    const tx = await this.signer.sendTransaction({
      to,
      value: ethers.parseEther(value),
    })
    
    return await tx.wait()
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider
  }

  getSigner(): ethers.Signer | null {
    return this.signer
  }
}

export const web3Client = new Web3Client()
