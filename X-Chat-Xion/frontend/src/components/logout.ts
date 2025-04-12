
export const logout= ()=>{
  try{
    localStorage.removeItem("address")
    localStorage.removeItem("xion-authz-granter-account")
    localStorage.removeItem("xion-authz-temp-account")
  }catch(err){
    throw new Error("error during logout")
  }
}

