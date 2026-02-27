use crate::core::types::*;
use anyhow::Result;
use async_trait::async_trait;
use std::collections::HashMap;

#[async_trait]
pub trait Consensus: Send + Sync {
    async fn validate_block(&self, block: &Block) -> Result<bool>;
    async fn propose_block(&self, parent: &Block) -> Result<Block>;
    async fn finalize_block(&self, block: &Block) -> Result<()>;
    async fn get_validators(&self) -> Vec<Address>;
}

pub struct DPoSConsensus {
    validators: HashMap<Address, ValidatorInfo>,
    epoch_duration: u64,
    max_validators: u32,
    min_stake: U256,
}

pub struct ValidatorInfo {
    address: Address,
    stake: U256,
    voting_power: u64,
    last_active: u64,
}

impl DPoSConsensus {
    pub fn new(epoch_duration: u64, max_validators: u32, min_stake: U256) -> Self {
        DPoSConsensus {
            validators: HashMap::new(),
            epoch_duration,
            max_validators,
            min_stake,
        }
    }
    
    pub fn add_validator(&mut self, address: Address, stake: U256) {
        if stake >= self.min_stake && self.validators.len() < self.max_validators as usize {
            self.validators.insert(address, ValidatorInfo {
                address,
                stake,
                voting_power: stake.as_u64(),
                last_active: 0,
            });
        }
    }
    
    pub fn update_validator_set(&mut self, timestamp: u64) {
        // Sort validators by stake and select top N
        let mut validators: Vec<&ValidatorInfo> = self.validators.values().collect();
        validators.sort_by(|a, b| b.stake.cmp(&a.stake));
        
        // Keep only top validators
        let new_validators: HashMap<_, _> = validators
            .into_iter()
            .take(self.max_validators as usize)
            .map(|v| (v.address, v.clone()))
            .collect();
        
        self.validators = new_validators;
    }
}

#[async_trait]
impl Consensus for DPoSConsensus {
    async fn validate_block(&self, block: &Block) -> Result<bool> {
        // Validate block producer
        if !self.validators.contains_key(&block.header.beneficiary) {
            return Ok(false);
        }
        
        // Validate timestamp
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        if block.header.timestamp > current_time + 15 {
            return Ok(false);
        }
        
        Ok(true)
    }
    
    async fn propose_block(&self, parent: &Block) -> Result<Block> {
        // Create new block proposal
        let header = BlockHeader {
            parent_hash: parent.hash(),
            ommers_hash: Hash::default(),
            beneficiary: Address::default(), // Set by validator
            state_root: Hash::default(),
            transactions_root: Hash::default(),
            receipts_root: Hash::default(),
            logs_bloom: vec![],
            difficulty: U256::from(1),
            number: parent.header.number + 1,
            gas_limit: parent.header.gas_limit,
            gas_used: 0,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            extra_data: vec![],
            mix_hash: Hash::default(),
            nonce: 0,
            base_fee_per_gas: parent.header.base_fee_per_gas,
        };
        
        Ok(Block {
            header,
            transactions: vec![],
            ommers: vec![],
        })
    }
    
    async fn finalize_block(&self, block: &Block) -> Result<()> {
        // Update validator activity
        // Reward block producer
        Ok(())
    }
    
    async fn get_validators(&self) -> Vec<Address> {
        self.validators.keys().cloned().collect()
    }
}
