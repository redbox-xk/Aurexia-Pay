use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use anyhow::Result;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Config {
    pub network: NetworkConfig,
    pub consensus: ConsensusConfig,
    pub blockchain: BlockchainConfig,
    pub storage: StorageConfig,
    pub rpc: RpcConfig,
    pub metrics: MetricsConfig,
    pub log: LogConfig,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct NetworkConfig {
    pub port: u16,
    pub rpc_port: u16,
    pub ws_port: u16,
    pub max_peers: u32,
    pub bootstrap_nodes: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ConsensusConfig {
    #[serde(rename = "type")]
    pub consensus_type: String,
    pub epoch_duration: u64,
    pub max_validators: u32,
    pub min_stake: String,
    pub unbonding_period: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct BlockchainConfig {
    pub chain_id: u64,
    pub block_time: u64,
    pub max_gas_limit: u64,
    pub max_block_size: usize,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct StorageConfig {
    pub data_dir: String,
    pub database: String,
    pub state_pruning: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RpcConfig {
    pub enabled: bool,
    pub api_modules: Vec<String>,
    pub cors_domains: Vec<String>,
    pub vhosts: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct MetricsConfig {
    pub enabled: bool,
    pub prometheus_port: u16,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LogConfig {
    pub level: String,
    pub file: String,
    pub format: String,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            network: NetworkConfig {
                port: 30303,
                rpc_port: 8545,
                ws_port: 8546,
                max_peers: 50,
                bootstrap_nodes: vec![],
            },
            consensus: ConsensusConfig {
                consensus_type: "dpos".to_string(),
                epoch_duration: 86400,
                max_validators: 21,
                min_stake: "1000000".to_string(),
                unbonding_period: 604800,
            },
            blockchain: BlockchainConfig {
                chain_id: 1337,
                block_time: 5,
                max_gas_limit: 15000000,
                max_block_size: 1048576,
            },
            storage: StorageConfig {
                data_dir: "./data".to_string(),
                database: "rocksdb".to_string(),
                state_pruning: "archive".to_string(),
            },
            rpc: RpcConfig {
                enabled: true,
                api_modules: vec![
                    "eth".to_string(),
                    "net".to_string(),
                    "web3".to_string(),
                    "personal".to_string(),
                    "txpool".to_string(),
                    "aurexia".to_string(),
                ],
                cors_domains: vec!["*".to_string()],
                vhosts: vec!["*".to_string()],
            },
            metrics: MetricsConfig {
                enabled: true,
                prometheus_port: 9090,
            },
            log: LogConfig {
                level: "info".to_string(),
                file: "./logs/aurexia.log".to_string(),
                format: "json".to_string(),
            },
        }
    }
}

impl Config {
    pub fn from_file<P: AsRef<Path>>(path: P) -> Result<Self> {
        let contents = fs::read_to_string(path)?;
        let config: Config = toml::from_str(&contents)?;
        Ok(config)
    }
}

pub fn load_config(path: &str) -> Result<Config> {
    if Path::new(path).exists() {
        Config::from_file(path)
    } else {
        Ok(Config::default())
    }
}
