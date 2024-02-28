// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract TweetPortal {

    event NewTweet(address indexed from, string message, uint256 timestamp);

    struct Tweet {
        address waver;
        string message;
        uint256 timestamp;
    }

    Tweet[] private _tweets;

    function postTweet(string memory _message) public {
        console.log("%s tweet w/ message %s", msg.sender, _message, block.timestamp);
        _tweets.push(Tweet(msg.sender, _message, block.timestamp));
        emit NewTweet(msg.sender, _message, block.timestamp);
    }

    function getTweet() public view returns(Tweet[] memory) {
        return _tweets;
    }
}