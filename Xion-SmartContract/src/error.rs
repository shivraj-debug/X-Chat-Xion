use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("User Already Exists")]
    UserExists {},

    #[error("Not an Admin")]
    NotAnAdmin {},

    #[error("Insufficient Amount")]
    InsufficientAmount {},

    #[error("User Not Found")]
    UserNotFound {},

    #[error("Invalid Amount")]
    InvalidAmount{},

    #[error("Insufficient Credits")]
    InsufficientCredits {},
}