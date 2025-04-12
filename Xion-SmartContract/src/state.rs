use schemars::JsonSchema;
use serde::{Deserialize, Serialize}; 

use cosmwasm_std::Addr;
use cw_storage_plus::{Item,Map};


// Contract configuration
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq,JsonSchema)]
pub struct Config {
    pub admin: Addr,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq,JsonSchema)]
pub struct Transaction {
    pub credits: u128,
    pub label: String,
    pub timestamp: u128,
    pub amount_used: u128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq,JsonSchema)]
pub struct User{
    pub credit_balance: u128,
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const USERS: Map<&Addr, User> = Map::new("user_credit");
pub const TRANSACTIONS: Map<&Addr, Vec<Transaction>> = Map::new("transactions");