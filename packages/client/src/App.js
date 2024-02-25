import './App.css';
import React, { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

/* ethers 変数を使えるようにする*/
import { ethers } from "ethers";
/* ABIファイルを含むWavePortal.jsonファイルをインポートする*/
import abi from "./utils/TweetPortal.json";

function App() {
  const [messageValue, setMessageValue] = useState("");
  const [allTweets, setAllTweets] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x1Da9C07d947b5180237c65d0609cb0fBd4bb51F6"
  const contractABI = abi.abi;

  const getTweet = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tweetContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const tweets = await tweetContract.getTweet();
        setAllTweets(tweets);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    let tweetPortalContract;

    const onNewEvent = (from, message) => {
      console.log("New Event", from, message);
      setAllTweets((prevState) => [
        ...prevState,
        {
          address: from,
          message: message
        }])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      tweetPortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      tweetPortalContract.on("NewTweet", onNewEvent);
      return () => {
        if (tweetPortalContract) {
          tweetPortalContract.off("NewTweet", onNewEvent)
        }
      }
    }
  }, [])

  const checkIfWalletIsConnected = async () => {
    try {
      // window.ethereumにアクセスできることを確認
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have Metamask!")
      } else {
        console.log("We have the ethereum object", ethereum)
      }

      // ユーザーのウォレットアドレスの許可を確認
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error)
    }
  };
  // ウォレット接続を実装
  const connectWallet = async () => {
    try {
      // ユーザーが認証可能なウォレットアドレスを持っているか確認
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask");
        return;
      }
      // 持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める。許可されれば、ユーザーの最初のウォレットアドレスを currentAccount に格納する。
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("connected: ", accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error);
    }
  };

  const postTweet = async () => {    
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tweetContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const tweetTxn = await tweetContract.postTweet(messageValue);
        await tweetTxn.wait()
        console.log("Mining...", tweetTxn.hash);
        const tweets = await tweetContract.getTweet();
        setAllTweets(tweets);
        console.log("Get All Tweets", allTweets);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => { checkIfWalletIsConnected(); }, []);
  return (
    <div className="App">
        <TextField id="standard-basic" label="Standard" variant="standard" onChange={(event) => {
          setMessageValue(event.target.value);
        }} />
        <Button
          onClick={() => {
          postTweet(messageValue);
          }}
        >
          Click me
      </Button>
      {currentAccount && (
        allTweets.slice(0).reverse().map(
          (wave, index) => {
            return (
              <div key={index} style={{ backgroundColor: '#F8F8FF', marginTop: "16px", padding: "8px" }}>
                <div>Address: {wave.address}</div>
                <div>Message: {wave.message}</div>
              </div>
            )
          }
        )
      )}
      {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
      {currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Wallet Connected
        </button>
      )}
    </div>
  );
}

export default App;
