#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{ to_json_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult};
use cw2::set_contract_version;


use crate::error::ContractError;
use crate::msg::{BuyCreditsMessage, ConfigResponse, ExecuteMsg, InstantiateMsg, QueryMsg, RegisterUserMessage, TransactionsResponse, UseCreditsMessage, UserResponse};
use crate::state::{Config, Transaction, User, CONFIG, TRANSACTIONS, USERS};

const CONTRACT_NAME: &str = "crates.io:xchat";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    // Validate admin address from message or default to sender
    let admin_addr = msg.admin.map_or(info.sender.clone(), |addr| {
         deps.api.addr_validate(&addr).unwrap_or(info.sender.clone())
    });

    // Initialize contract configuration with admin address
    let config = Config {
        admin: admin_addr,
    };

    // Set contract version for migration purposes
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    // Store configuration in contract storage
    CONFIG.save(deps.storage, &config)?;

    // Return successful response with initialization metadata
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("admin", info.sender)
        .add_attribute("credits", (4096*4).to_string()))
}


#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    // Route execution to appropriate handler based on message type
    match msg {
        ExecuteMsg::RegisterUser(msg) => execute_register_user(deps, env, info, msg),
        ExecuteMsg::BuyCredits(msg) => execute_buy_points(deps, env, info, msg),
        ExecuteMsg::UseCredits(msg) => execute_use_points(deps, env, info, msg),
    }
}

pub fn execute_register_user(
    deps: DepsMut,
    _env: Env,
    info:MessageInfo,
    _msg: RegisterUserMessage,
) -> Result<Response, ContractError> {
    let user_addr = info.sender.clone();
    if USERS.has(deps.storage, &user_addr) {
        return Err(ContractError::UserExists {});
    }

    let new_user = User {
        credit_balance: 0,
    };

    USERS.save(deps.storage, &user_addr, &new_user)?;

    Ok(Response::new()
        .add_attribute("action", "register_user")
        .add_attribute("user", user_addr.to_string()))
}


pub fn execute_buy_points(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: BuyCreditsMessage
) -> Result<Response, ContractError> 
{

    let buyer_addr = info.sender.clone();
    
    let credits_to_be_added: u128;
    
    let mut user = USERS.load(deps.storage, &buyer_addr)
        .map_err(|_| ContractError::UserNotFound {})?;


    if msg.bundle == "Starter Pack" {
        credits_to_be_added = 25;
        let amount_required = 0.01;
        
        let payment = info.funds
            .iter()
            .find(|coin| coin.denom == "uxion") 
            .ok_or_else(|| ContractError::InsufficientAmount {})?;

        let required_amount = (amount_required * 1_000_000.0) as u128;
        
        if payment.amount.u128() < required_amount {
            return Err(ContractError::InsufficientAmount {});
        }
    }
    
    else if msg.bundle == "Advanced Pack" {
        credits_to_be_added = 60;
        let amount_required = 0.02;
        
        let payment = info.funds
            .iter()
            .find(|coin| coin.denom == "uxion") 
            .ok_or_else(|| ContractError::InsufficientAmount {})?;

        let required_amount = (amount_required * 1_000_000.0) as u128;
        
        if payment.amount.u128() < required_amount {
            return Err(ContractError::InsufficientAmount {});
        }
    }
    else if msg.bundle == "Elite Pack" {
        credits_to_be_added = 200;
        let amount_required = 0.05;
        
        let payment = info.funds
            .iter()
            .find(|coin| coin.denom == "uxion") 
            .ok_or_else(|| ContractError::InsufficientAmount {})?;

        let required_amount = (amount_required * 1_000_000.0) as u128;
        
        if payment.amount.u128() < required_amount {
            return Err(ContractError::InsufficientAmount {});
        }
    }
    else {
        return Err(ContractError::InvalidAmount {});
    }

    user.credit_balance += credits_to_be_added;
    USERS.save(deps.storage, &buyer_addr, &user)?;
    
    let label = format!("Your {} plan successfully activated", msg.bundle);

    let new_transaction = Transaction {
        credits: credits_to_be_added,
        label,
        timestamp: current_time as u128,
        amount_used: 0,
    };
    
    let transactions = TRANSACTIONS.may_load(deps.storage, &buyer_addr)?.unwrap_or_default();

    let mut updated_transactions = transactions;
    updated_transactions.push(new_transaction);

    TRANSACTIONS.save(deps.storage, &buyer_addr, &updated_transactions)?;


    Ok(Response::new()
        .add_attribute("action", "buy_credits")
        .add_attribute("credits", user.credit_balance.to_string())
        .add_attribute("buyer", buyer_addr.to_string()))
}

pub fn execute_use_points(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: UseCreditsMessage
) -> Result<Response, ContractError> 
{
    let credit_user_addr = info.sender.clone();



    let mut user = USERS.load(deps.storage, &credit_user_addr)
        .map_err(|_| ContractError::UserNotFound {})?;

    if user.credit_balance < msg.credits  {
        return Err(ContractError::InsufficientCredits {});
    }

    user.credit_balance -= msg.credits;

    USERS.save(deps.storage, &credit_user_addr, &user)?;

    let new_transaction = Transaction {
        credits: msg.credits,
        label: String::from("Used in chat"),
        timestamp: env.block.time.seconds() as u128,
        amount_used: 0,
    };
    
    let transactions = TRANSACTIONS.may_load(deps.storage, &credit_user_addr)?.unwrap_or_default();

    let mut updated_transactions = transactions;
    updated_transactions.push(new_transaction);

    TRANSACTIONS.save(deps.storage, &credit_user_addr, &updated_transactions)?;

    Ok(Response::new()
        .add_attribute("action", "use_credits")
        .add_attribute("credits", msg.credits.to_string())
        .add_attribute("credit user", credit_user_addr.to_string()))
}


#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetConfig {} => query_config(deps),
        QueryMsg::GetUser { address } => query_user(deps, address),
        QueryMsg::GetTransactions { address } => query_transactions(deps, address)
    }
}
fn query_config(deps: Deps) -> StdResult<Binary> {
    let config = CONFIG.load(deps.storage)?;
    to_json_binary(&ConfigResponse { config })
}

fn query_user(deps: Deps, address: Addr) -> StdResult<Binary> {
    let user = USERS.load(deps.storage, &address)?;
    to_json_binary(&UserResponse { user })
}

fn query_transactions(deps: Deps, address: Addr) -> StdResult<Binary> {
    let transactions = TRANSACTIONS.load(deps.storage, &address)?;
    to_json_binary(&TransactionsResponse { transactions })
}
