const { exec } = require('child_process')
const fs = require('fs')

async function main() {
  console.log('🚀 AUREXIA MAINNET - L1 DEPLOYMENT')

  exec('go build -o aurexiad ./consensus/cmd/aurexiad', (error) => {
    if (error) {
      console.error(`Error: ${error}`)
      return
    }
    console.log('✅ Consensus node built')
  })

  const genesis = {
    config: { chainId: 666 },
    gasLimit: '0x1C9C380',
    difficulty: '0x1',
    baseFeePerGas: '0x3B9ACA00'
  }

  fs.writeFileSync('./consensus/genesis.json', JSON.stringify(genesis, null, 2))
  console.log('✅ Genesis file created')
}

main().catch(console.error)
