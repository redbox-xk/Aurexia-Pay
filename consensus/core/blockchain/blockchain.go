use crate::core::consensus::Consensus;
use crate::core::state::StateDB;
use crate::core::types::*;
use anyhow::Result;
use rocksdb::{DB, Options};
use sha3::{Digest, Keccak256};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{info, warn};

pub struct Blockchain {
    db: Arc<DB>,
    state: Arc<RwLock<StateDB>>,
    consensus: Arc<dyn Consensus + Send + Sync>,
    current_block: Arc<RwLock<Option<Block>>>,
    block_cache: Arc<RwLock<HashMap<Hash, Block>>>,
}

impl Blockchain {
    pub fn new(data_dir: &str, consensus: Arc<dyn Consensus + Send + Sync>) -> Result<Self> {
        let mut opts = Options::default();
        opts.create_if_missing(true);
        opts.set_max_open_files(1000);
        
        let db = Arc::new(DB::open(&opts, format!("{}/chain", data_dir))?);
        let state = Arc::new(RwLock::new(StateDB::new(format!("{}/state", data_dir))?));
        
        Ok(Blockchain {
            db,
            state,
            consensus,
            current_block: Arc::new(RwLock::new(None)),
            block_cache: Arc::new(RwLock::new(HashMap::new())),
        })
    }
    
    pub async fn init(&self) -> Result<()> {
        // Load genesis block if chain is empty
        if self.get_block_by_number(0).await?.is_none() {
            info!("Initializing genesis block");
            let genesis = self.create_genesis_block()?;
            self.insert_block(genesis).await?;
        }
        
        // Load latest block
        if let Some(latest_hash) = self.get_latest_block_hash()? {
            let latest_block = self.get_block(&latest_hash).await?;
            *self.current_block.write().await = Some(latest_block);
        }
        
        Ok(())
    }
    
    fn create_genesis_block(&self) -> Result<Block> {
        let genesis = Block {
            header: BlockHeader {
                parent_hash: Hash::default(),
                ommers_hash: Hash::default(),
                beneficiary: Address::default(),
                state_root: Hash::default(),
                transactions_root: Hash::default(),
                receipts_root: Hash::default(),
                logs_bloom: vec![],
                difficulty: U256::from(1),
                number: 0,
                gas_limit: 15000000,
                gas_used: 0,
                timestamp: 0,
                extra_data: vec![],
                mix_hash: Hash::default(),
                nonce: 0,
                base_fee_per_gas: U256::from(1000000000),
            },
            transactions: vec![],
            ommers: vec![],
        };
        
        Ok(genesis)
    }
    
    pub async fn insert_block(&self, block: Block) -> Result<()> {
        // Validate block
        self.validate_block(&block).await?;
        
        // Execute transactions
        let receipts = self.execute_block(&block).await?;
        
        // Update state
        {
            let mut state = self.state.write().await;
            state.commit_block(&block, &receipts)?;
        }
        
        // Store block
        let hash = block.hash();
        let number = block.header.number;
        
        self.db.put(format!("block:{}", hash), bincode::serialize(&block)?)?;
        self.db.put(format!("hash:{}", number), hash.as_bytes())?;
        self.db.put("latest", hash.as_bytes())?;
        
        // Update cache
        {
            let mut cache = self.block_cache.write().await;
            cache.insert(hash, block);
        }
        
        // Update current block
        *self.current_block.write().await = Some(block);
        
        Ok(())
    }
    
    async fn validate_block(&self, block: &Block) -> Result<()> {
        // Validate block header
        if block.header.number > 0 {
            let parent = self.get_block_by_number(block.header.number - 1).await?
                .ok_or_else(|| anyhow::anyhow!("Parent block not found"))?;
            
            if block.header.parent_hash != parent.hash() {
                anyhow::bail!("Invalid parent hash");
            }
            
            if block.header.timestamp <= parent.header.timestamp {
                anyhow::bail!("Invalid timestamp");
            }
        }
        
        // Validate gas limit
        if block.header.gas_used > block.header.gas_limit {
            anyhow::bail!("Gas used exceeds gas limit");
        }
        
        // Validate block size
        let block_size = bincode::serialized_size(block)?;
        if block_size > 1048576 { // 1MB
            anyhow::bail!("Block too large");
        }
        
        Ok(())
    }
    
    async fn execute_block(&self, block: &Block) -> Result<Vec<Receipt>> {
        let mut receipts = Vec::new();
        let mut state = self.state.write().await;
        
        for tx in &block.transactions {
            let receipt = state.execute_transaction(tx)?;
            receipts.push(receipt);
        }
        
        Ok(receipts)
    }
    
    pub async fn get_block(&self, hash: &Hash) -> Result<Block> {
        // Check cache first
        {
            let cache = self.block_cache.read().await;
            if let Some(block) = cache.get(hash) {
                return Ok(block.clone());
            }
        }
        
        // Read from database
        let data = self.db.get(format!("block:{}", hash))?;
        match data {
            Some(bytes) => {
                let block: Block = bincode::deserialize(&bytes)?;
                
                // Update cache
                let mut cache = self.block_cache.write().await;
                cache.insert(*hash, block.clone());
                
                Ok(block)
            }
            None => anyhow::bail!("Block not found"),
        }
    }
    
    pub async fn get_block_by_number(&self, number: u64) -> Result<Option<Block>> {
        let hash_key = format!("hash:{}", number);
        let hash_bytes = self.db.get(hash_key)?;
        
        match hash_bytes {
            Some(bytes) => {
                let hash = Hash::try_from(bytes.as_slice())?;
                Ok(Some(self.get_block(&hash).await?))
            }
            None => Ok(None),
        }
    }
    
    pub fn get_latest_block_hash(&self) -> Result<Option<Hash>> {
        match self.db.get("latest")? {
            Some(bytes) => Ok(Some(Hash::try_from(bytes.as_slice())?)),
            None => Ok(None),
        }
    }
    
    pub async fn current_block(&self) -> Option<Block> {
        self.current_block.read().await.clone()
    }
}
