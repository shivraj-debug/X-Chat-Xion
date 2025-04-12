use cosmwasm_schema::cw_serde;
use cosmwasm_std::Addr;use crate::state::{User, Config, Transaction};

/// Initial configuration message for contract instantiation
/// Allows setting an optional admin address with special privileges
#[cw_serde]
pub struct InstantiateMsg {
    pub admin: Option<String>,  
}

/// Message for registering new users in the platform
/// Currently takes no parameters as registration is based on sender address
#[cw_serde]
pub struct RegisterUserMessage {}

/// Message for purchasing credit bundles of different types
/// The bundle parameter identifies which credit package to purchase
#[cw_serde]
pub struct BuyCreditsMessage {
    pub bundle: String,
}

/// Message for spending credits on platform services
/// Specifies the number of credits to consume
#[cw_serde]
pub struct UseCreditsMessage {
    pub credits: u128,
}

/// Detailed transaction information for recording credit operations
/// Includes metadata about the transaction type, timing, and amounts
#[cw_serde]
pub struct TransactionMessage {
    pub credits: u128,
    pub label: String,
    pub timestamp: u128,
    pub amount_used: u128,
}

/// Contract executable messages that trigger state changes
#[cw_serde]
pub enum ExecuteMsg {
    RegisterUser(RegisterUserMessage),
    BuyCredits(BuyCreditsMessage),
    UseCredits(UseCreditsMessage),
}

/// Query messages for reading contract state without modifications
#[cw_serde]
pub enum QueryMsg {
    GetConfig {},
    GetUser { address: Addr },
    GetTransactions { address: Addr },
}

/// Response wrapper for contract configuration information
#[cw_serde]
pub struct ConfigResponse {
    pub config: Config,
}

/// Response wrapper for user account information
#[cw_serde]
pub struct UserResponse {
    pub  user:User
}

/// Response wrapper for transaction history lookup
#[cw_serde]
pub struct TransactionsResponse {
    pub transactions: Vec<Transaction>,
}