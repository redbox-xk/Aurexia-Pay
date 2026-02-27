use clap::{Parser, Subcommand};
use serde_json::json;
use reqwest::Client;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
    
    /// RPC endpoint
    #[arg(short, long, default_value = "http://localhost:8545")]
    endpoint: String,
}

#[derive(Subcommand)]
enum Commands {
    /// Get blockchain info
    Info,
    
    /// Get account balance
    Balance {
        /// Account address
        address: String,
    },
    
    /// Send transaction
    Send {
        /// From address
        from: String,
        /// To address
        to: String,
        /// Amount
        amount: String,
    },
    
    /// Deploy contract
    Deploy {
        /// Contract bytecode
        bytecode: String,
    },
    
    /// Get block by number
    Block {
        /// Block number (use 'latest' for latest block)
        number: String,
    },
    
    /// Get transaction by hash
    Tx {
        /// Transaction hash
        hash: String,
    },
    
    /// List peers
    Peers,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    let client = Client::new();
    
    match &cli.command {
        Commands::Info => {
            let response = client.post(&cli.endpoint)
                .json(&json!({
                    "jsonrpc": "2.0",
                    "method": "aurexia_info",
                    "params": [],
                    "id": 1
                }))
                .send()
                .await?;
            
            println!("{:#?}", response.json::<serde_json::Value>().await?);
        }
        
        Commands::Balance { address } => {
            let response = client.post(&cli.endpoint)
                .json(&json!({
                    "jsonrpc": "2.0",
                    "method": "eth_getBalance",
                    "params": [address, "latest"],
                    "id": 1
                }))
                .send()
                .await?;
            
            println!("Balance: {:#?}", response.json::<serde_json::Value>().await?);
        }
        
        Commands::Send { from, to, amount } => {
            let response = client.post(&cli.endpoint)
                .json(&json!({
                    "jsonrpc": "2.0",
                    "method": "eth_sendTransaction",
                    "params": [{
                        "from": from,
                        "to": to,
                        "value": amount
                    }],
                    "id": 1
                }))
                .send()
                .await?;
            
            println!("Transaction hash: {:#?}", response.json::<serde_json::Value>().await?);
        }
        
        Commands::Deploy { bytecode } => {
            let response = client.post(&cli.endpoint)
                .json(&json!({
                    "jsonrpc": "2.0",
                    "method": "eth_sendTransaction",
                    "params": [{
                        "data": bytecode
                    }],
                    "id": 1
                }))
                .send()
                .await?;
            
            println!("Contract deployed: {:#?}", response.json::<serde_json::Value>().await?);
        }
        
        Commands::Block { number } => {
            let response = client.post(&cli.endpoint)
                .json(&json!({
                    "jsonrpc": "2.0",
                    "method": "eth_getBlockByNumber",
                    "params": [number, true],
                    "id": 1
                }))
                .send()
                .await?;
            
            println!("{:#?}", response.json::<serde_json::Value>().await?);
        }
        
        Commands::Tx { hash } => {
            let response = client.post(&cli.endpoint)
                .json(&json!({
                    "jsonrpc": "2.0",
                    "method": "eth_getTransactionByHash",
                    "params": [hash],
                    "id": 1
                }))
                .send()
                .await?;
            
            println!("{:#?}", response.json::<serde_json::Value>().await?);
        }
        
        Commands::Peers => {
            let response = client.post(&cli.endpoint)
                .json(&json!({
                    "jsonrpc": "2.0",
                    "method": "net_peerCount",
                    "params": [],
                    "id": 1
                }))
                .send()
                .await?;
            
            println!("Peers: {:#?}", response.json::<serde_json::Value>().await?);
        }
    }
    
    Ok(())
}
