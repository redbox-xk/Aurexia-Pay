use serde::{Deserialize, Serialize};
use sha3::{Digest, Keccak256};
use std::convert::TryFrom;

pub type Address = [u8; 20];
pub type Hash = [u8; 32];
pub type U256 = [u8; 32];

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    pub header: BlockHeader,
    pub transactions: Vec<Transaction>,
    pub ommers: Vec<BlockHeader>,
}

impl Block {
    pub fn hash(&self) -> Hash {
        let mut hasher = Keccak256::new();
        hasher.update(bincode::serialize(&self.header).unwrap());
        hasher.finalize().into()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockHeader {
    pub parent_hash: Hash,
    pub ommers_hash: Hash,
    pub beneficiary: Address,
    pub state_root: Hash,
    pub transactions_root: Hash,
    pub receipts_root: Hash,
    pub logs_bloom: Vec<u8>,
    pub difficulty: U256,
    pub number: u64,
    pub gas_limit: u64,
    pub gas_used: u64,
    pub timestamp: u64,
    pub extra_data: Vec<u8>,
    pub mix_hash: Hash,
    pub nonce: u64,
    pub base_fee_per_gas: U256,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub nonce: u64,
    pub gas_price: U256,
    pub gas_limit: u64,
    pub to: Option<Address>,
    pub value: U256,
    pub data: Vec<u8>,
    pub v: u64,
    pub r: U256,
    pub s: U256,
}

impl Transaction {
    pub fn hash(&self) -> Hash {
        let mut hasher = Keccak256::new();
        hasher.update(bincode::serialize(self).unwrap());
        hasher.finalize().into()
    }
    
    pub fn from(&self) -> Result<Address, anyhow::Error> {
        // Recover signer from signature
        Ok([0u8; 20]) // Placeholder
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Receipt {
    pub tx_hash: Hash,
    pub gas_used: u64,
    pub cumulative_gas_used: u64,
    pub logs: Vec<Log>,
    pub status: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Log {
    pub address: Address,
    pub topics: Vec<Hash>,
    pub data: Vec<u8>,
    pub block_number: u64,
    pub tx_hash: Hash,
    pub tx_index: u32,
    pub block_hash: Hash,
    pub index: u32,
    pub removed: bool,
}

impl TryFrom<&[u8]> for Hash {
    type Error = anyhow::Error;
    
    fn try_from(bytes: &[u8]) -> Result<Self, Self::Error> {
        if bytes.len() != 32 {
            anyhow::bail!("Invalid hash length");
        }
        let mut hash = [0u8; 32];
        hash.copy_from_slice(bytes);
        Ok(hash)
    }
}
