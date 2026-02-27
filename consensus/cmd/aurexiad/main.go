use clap::Parser;
use tracing::{info, error};
use tracing_subscriber;

mod node;
mod config;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Path to config file
    #[arg(short, long, default_value = "config.toml")]
    config: String,

    /// Enable JSON-RPC server
    #[arg(long, default_value_t = true)]
    rpc: bool,

    /// Enable WebSocket server
    #[arg(long, default_value_t = true)]
    ws: bool,

    /// Bootstrap network
    #[arg(short, long)]
    bootstrap: bool,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    // Parse command line arguments
    let cli = Cli::parse();
    
    info!("Starting Aurexia Consensus Node");
    info!("Config file: {}", cli.config);
    
    // Load configuration
    let config = config::load_config(&cli.config)?;
    
    // Initialize node
    let mut node = node::Node::new(config).await?;
    
    // Start node
    if let Err(e) = node.start().await {
        error!("Failed to start node: {}", e);
        return Err(e);
    }
    
    // Wait for shutdown signal
    tokio::signal::ctrl_c().await?;
    info!("Shutting down...");
    
    node.stop().await?;
    
    Ok(())
}
