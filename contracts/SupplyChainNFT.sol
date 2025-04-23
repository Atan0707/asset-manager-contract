// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyChainNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct Product {
        string nfcId;
        string productName;
        string manufacturer;
        uint256 manufacturingDate;
        string productCategory;
        string description;
        bool isRegistered;
    }

    struct LocationUpdate {
        string location;
        uint256 timestamp;
        string handler;
    }

    mapping(uint256 => Product) public products;
    mapping(string => uint256) public nfcToTokenId;
    mapping(uint256 => LocationUpdate[]) public locationHistory;

    event ProductRegistered(uint256 tokenId, string nfcId, address owner);
    event LocationUpdated(uint256 tokenId, string location, string handler);

    constructor() ERC721("TrackNFT", "TRCK") Ownable(msg.sender) {}

    function registerProduct(
        string memory nfcId,
        string memory productName,
        string memory manufacturer,
        uint256 manufacturingDate,
        string memory productCategory,
        string memory description,
        address owner
    ) public returns (uint256) {
        require(!isNFCRegistered(nfcId), "NFC ID already registered");
        
        uint256 newTokenId = ++_nextTokenId;

        products[newTokenId] = Product(
            nfcId,
            productName,
            manufacturer,
            manufacturingDate,
            productCategory,
            description,
            true
        );

        nfcToTokenId[nfcId] = newTokenId;
        _safeMint(owner, newTokenId);

        emit ProductRegistered(newTokenId, nfcId, owner);
        return newTokenId;
    }

    function updateLocation(
        string memory nfcId,
        string memory location,
        string memory handler
    ) public {
        uint256 tokenId = nfcToTokenId[nfcId];
        require(tokenId != 0, "Product not registered");

        LocationUpdate memory newUpdate = LocationUpdate(
            location,
            block.timestamp,
            handler
        );
        locationHistory[tokenId].push(newUpdate);

        emit LocationUpdated(tokenId, location, handler);
    }

    function getProduct(string memory nfcId) public view returns (Product memory) {
        uint256 tokenId = nfcToTokenId[nfcId];
        require(tokenId != 0, "Product not registered");
        return products[tokenId];
    }

    function getLocationHistory(string memory nfcId) public view returns (LocationUpdate[] memory) {
        uint256 tokenId = nfcToTokenId[nfcId];
        require(tokenId != 0, "Product not registered");
        return locationHistory[tokenId];
    }

    function isNFCRegistered(string memory nfcId) public view returns (bool) {
        return nfcToTokenId[nfcId] != 0;
    }
} 