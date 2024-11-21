// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract AssetManager2 {
    struct Account  {
        string email;
        string password;
    }

    string public expectedHash = "0x";
    string public nama = "abu";

    Account[] public account;

    event AccountCreated(string email);

    function checkAccount(string memory _email, string memory _password) public view returns(bool) {
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(bytes(_password).length > 0, "Password cannot be empty");
        
        return (keccak256(abi.encodePacked(account[0].email)) == keccak256(abi.encodePacked(_email)) && 
                keccak256(abi.encodePacked(account[0].password)) == keccak256(abi.encodePacked(_password)));
    }

    function createAccount(string memory _email, string memory _password) public {
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(bytes(_password).length > 0, "Password cannot be empty");
        
        Account memory newAccount = Account(_email, _password);
        account.push(newAccount);
        
        emit AccountCreated(_email);
    }

    function getData(string calldata _hash) public view{
    if (keccak256(abi.encodePacked(_hash)) == keccak256(abi.encodePacked(expectedHash))) {
        viewData();
    }
}

    function viewData() public view returns(string memory) {
        return nama;
    }
}
