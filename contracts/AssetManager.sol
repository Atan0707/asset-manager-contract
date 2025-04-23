// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract AssetManager {

    address public owner;
    address[] public admin;

    struct Properties {
        string title;
        string details;
        string gambar; // optional - using IPFS
    }

    struct CustomerData {
        string name;
        string ic;
        string contactNo;
        string Address;
    }

    struct Inheritor {
        string name;
        string ic;
        string contactNo;
        string Address;
        string relationship;
    }

    Properties[] public properties;
    CustomerData[] public customers;
    Inheritor[] public inheritors;

    mapping(uint256 => Properties[]) public customerProperties;
    mapping(uint256 => Inheritor[]) public customerInheritors;

    uint256 public customerIdCounter; // Automatic customer ID counter

    // New structures for Islamic agreements
    struct Agreement {
        string ipfsHash;           // IPFS hash of the agreement document
        uint256 timestamp;         // When the agreement was created
        string agreementType;      // Type of Islamic agreement (e.g., Murabaha, Ijara, Musharaka)
        bool isActive;             // Agreement status
        string[] signatures;       // Array of signatures from involved parties
        mapping(address => bool) hasSignedAgreement; // Track who has signed
    }

    // Mapping to store agreements for each customer
    mapping(uint256 => Agreement[]) public customerAgreements;
    
    // Event declarations
    event AgreementCreated(
        uint256 indexed customerId,
        uint256 agreementId,
        string ipfsHash,
        string agreementType
    );
    
    event AgreementSigned(
        uint256 indexed customerId,
        uint256 agreementId,
        address signer,
        string signature
    );

    constructor() {
        owner = msg.sender;
        customerIdCounter = 0; // Start IDs from 0
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner has access");
        _;
    }

    modifier onlyAdminOrOwner() {
        require(isAdmin(msg.sender) || msg.sender == owner, "Only owner or admin has access");
        _;
    }

    function isAdmin(address _addr) public view returns (bool) {
        for (uint256 i = 0; i < admin.length; i++) {
            if (admin[i] == _addr) {
                return true;
            }
        }
        return false;
    }

    modifier customerExists(uint256 customerId) {
        require(bytes(customers[customerId].name).length != 0, "Customer does not exist.");
        _;
    }

    // Function to add an admin, only callable by the owner
    function addAdmin(address _admin) public onlyOwner {
        admin.push(_admin);
    }

    // Function to add customer data with an automatic ID, restricted to admin or owner
    function addCustomerData(
        string memory name, 
        string memory ic,
        string memory contactNo,
        string memory Address
    ) public onlyAdminOrOwner returns (uint256) {
        CustomerData memory newCustomer = CustomerData(name, ic, contactNo, Address);
        customers.push(newCustomer);

        uint256 newCustomerId = customerIdCounter; // Assign current counter value as the customer ID
        customerIdCounter++; // Increment the counter for the next customer

        return newCustomerId; // Return the newly generated customer ID
    }

    // Function to add properties for a customer by customerId, restricted to admin or owner
    function addCustomerProperty(
        uint256 customerId, 
        string memory title, 
        string memory details, 
        string memory gambar
    ) public onlyAdminOrOwner customerExists(customerId) {
        Properties memory newProperty = Properties(title, details, gambar);
        customerProperties[customerId].push(newProperty);
    }

    // Function to add an inheritor for a customer by customerId, restricted to admin or owner
    function addCustomerInheritor(
        uint256 customerId, 
        string memory name, 
        string memory ic, 
        string memory contactNo, 
        string memory Address,
        string memory relationship
    ) public onlyAdminOrOwner customerExists(customerId) {
        Inheritor memory newInheritor = Inheritor(name, ic, contactNo, Address, relationship);
        customerInheritors[customerId].push(newInheritor);
    }

    // Function to update customer data by customerId, restricted to admin or owner
    function updateCustomerData(
        uint256 customerId,
        string memory name,
        string memory ic,
        string memory contactNo,
        string memory Address
    ) public onlyAdminOrOwner customerExists(customerId) {
        customers[customerId].name = name;
        customers[customerId].ic = ic;
        customers[customerId].contactNo = contactNo;
        customers[customerId].Address = Address;
    }

    // Function to update properties for a customer by customerId, restricted to admin or owner
    function updateCustomerProperty(
        uint256 customerId,
        uint256 propertyIndex,
        string memory title,
        string memory details,
        string memory gambar
    ) public onlyAdminOrOwner customerExists(customerId) {
        customerProperties[customerId][propertyIndex].title = title;
        customerProperties[customerId][propertyIndex].details = details;
        customerProperties[customerId][propertyIndex].gambar = gambar;
    }

    // Function to update inheritors for a customer by customerId, restricted to admin or owner
    function updateCustomerInheritor(
        uint256 customerId,
        uint256 inheritorIndex,
        string memory name,
        string memory ic,
        string memory contactNo,
        string memory Address
    ) public onlyAdminOrOwner customerExists(customerId) {
        customerInheritors[customerId][inheritorIndex].name = name;
        customerInheritors[customerId][inheritorIndex].ic = ic;
        customerInheritors[customerId][inheritorIndex].contactNo = contactNo;
        customerInheritors[customerId][inheritorIndex].Address = Address;
    }

    // Function to delete customer data by customerId, restricted to admin or owner
    function deleteCustomerData(uint256 customerId) public onlyAdminOrOwner customerExists(customerId) {
        delete customers[customerId];
    }

    // Function to delete properties for a customer by customerId, restricted to admin or owner
    function deleteCustomerProperty(uint256 customerId, uint256 propertyIndex) public onlyAdminOrOwner customerExists(customerId) {
        delete customerProperties[customerId][propertyIndex];
    }

    // Function to delete inheritors for a customer by customerId, restricted to admin or owner
    function deleteCustomerInheritor(uint256 customerId, uint256 inheritorIndex) public onlyAdminOrOwner customerExists(customerId) {
        delete customerInheritors[customerId][inheritorIndex];
    }

    // Function to get customer data by customerId
    function getCustomerData(uint256 customerId) public view customerExists(customerId) returns (CustomerData memory) {
        return customers[customerId];
    }

    // Function to get properties for a customer by customerId
    function getCustomerProperties(uint256 customerId) public view customerExists(customerId) returns (Properties[] memory) {
        return customerProperties[customerId];
    }

    // Function to get inheritors for a customer by customerId
    function getCustomerInheritors(uint256 customerId) public view customerExists(customerId) returns (Inheritor[] memory) {
        return customerInheritors[customerId];
    }

    // Function to get all customers
    function getAllCustomers() public view returns (CustomerData[] memory) {
        return customers;
    }

    // Function to create a new agreement
    function createAgreement(
        uint256 customerId,
        string memory ipfsHash,
        string memory agreementType
    ) public onlyAdminOrOwner customerExists(customerId) {
        Agreement storage newAgreement = customerAgreements[customerId].push();
        newAgreement.ipfsHash = ipfsHash;
        newAgreement.timestamp = block.timestamp;
        newAgreement.agreementType = agreementType;
        newAgreement.isActive = true;

        emit AgreementCreated(
            customerId,
            customerAgreements[customerId].length - 1,
            ipfsHash,
            agreementType
        );
    }

    // Function to sign an agreement
    function signAgreement(
        uint256 customerId,
        uint256 agreementId,
        string memory signature
    ) public customerExists(customerId) {
        Agreement storage agreement = customerAgreements[customerId][agreementId];
        require(agreement.isActive, "Agreement is not active");
        require(!agreement.hasSignedAgreement[msg.sender], "Already signed");

        agreement.signatures.push(signature);
        agreement.hasSignedAgreement[msg.sender] = true;

        emit AgreementSigned(customerId, agreementId, msg.sender, signature);
    }

    // Function to get agreement details
    function getAgreement(uint256 customerId, uint256 agreementId)
        public
        view
        customerExists(customerId)
        returns (
            string memory ipfsHash,
            uint256 timestamp,
            string memory agreementType,
            bool isActive,
            string[] memory signatures
        )
    {
        Agreement storage agreement = customerAgreements[customerId][agreementId];
        return (
            agreement.ipfsHash,
            agreement.timestamp,
            agreement.agreementType,
            agreement.isActive,
            agreement.signatures
        );
    }

    // Function to get the number of agreements for a customer
    function getAgreementCount(uint256 customerId) 
        public 
        view 
        customerExists(customerId) 
        returns (uint256) 
    {
        return customerAgreements[customerId].length;
    }

    // Function to deactivate an agreement
    function deactivateAgreement(uint256 customerId, uint256 agreementId)
        public
        onlyAdminOrOwner
        customerExists(customerId)
    {
        require(customerAgreements[customerId][agreementId].isActive, "Agreement already inactive");
        customerAgreements[customerId][agreementId].isActive = false;
    }

    // Function to verify if an address has signed an agreement
    function hasSignedAgreement(
        uint256 customerId,
        uint256 agreementId,
        address signer
    ) public view customerExists(customerId) returns (bool) {
        return customerAgreements[customerId][agreementId].hasSignedAgreement[signer];
    }

    receive() external payable {} // to support receiving ETH by default
    fallback() external payable {}

}
