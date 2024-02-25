// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract TweetPortal {

    event NewTweet(address indexed from, string message);

    struct Tweet {
        address waver;
        string message;
    }

    Tweet[] private _tweets;

    function postTweet(string memory _message) public {
        console.log("%s tweet w/ message %s", msg.sender, _message);
        _tweets.push(Tweet(msg.sender, _message));
        emit NewTweet(msg.sender, _message);
    }

    function getTweet() public view returns(Tweet[] memory) {
        return _tweets;
    }
}