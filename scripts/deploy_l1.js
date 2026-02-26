const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function runBuild(repoRoot) {
  const aurexiadPath = path.join(repoRoot, 'aurexiad')

  try {
    execSync('go version', { stdio: 'ignore' })
  } catch (_) {
    console.warn('⚠️ Go toolchain not found in PATH; skipping consensus binary build.')
    return
  }

  try {
    execSync('go build -o aurexiad ./consensus/cmd/aurexiad', {
      cwd: repoRoot,
      stdio: 'inherit'
    })
    console.log(`✅ Consensus node built at ${aurexiadPath}`)
  } catch (error) {
    console.warn('⚠️ Consensus build skipped due to missing/incomplete Go package layout.')
    console.warn(`   Details: ${error.message}`)
  }
}

function writeGenesis(repoRoot) {
  const genesis = {
    config: { chainId: 666 },
    gasLimit: '0x1C9C380',
    difficulty: '0x1',
    baseFeePerGas: '0x3B9ACA00'
  }

  const consensusDir = path.join(repoRoot, 'consensus')
  const consensusGenesisPath = path.join(consensusDir, 'genesis.json')

  fs.mkdirSync(consensusDir, { recursive: true })
  fs.writeFileSync(consensusGenesisPath, `${JSON.stringify(genesis, null, 2)}\n`)
  console.log(`✅ Genesis file created at ${consensusGenesisPath}`)
}

async function main() {
  console.log('🚀 AUREXIA MAINNET - L1 DEPLOYMENT')

  const repoRoot = path.resolve(__dirname, '..')
  runBuild(repoRoot)
  writeGenesis(repoRoot)
}

main().catch((error) => {
  console.error('❌ Deployment failed:', error)
  process.exitCode = 1
})
