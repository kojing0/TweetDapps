import './App.css';
import React, { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';

/* ethers 変数を使えるようにする*/
import { ethers } from "ethers";
/* ABIファイルを含むWavePortal.jsonファイルをインポートする*/
import abi from "./utils/TweetPortal.json";

function App() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = React.useState(false);
  const timer = React.useRef();
  const [messageValue, setMessageValue] = useState("");
  const [allTweets, setAllTweets] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x6B52ecE57282a5bBf3EF2aE564365821f5B2C119"
  const contractABI = abi.abi;

  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      '&:hover': {
        bgcolor: green[700],
      },
    }),
  };

  // const getTweet = async () => {
  //   try {
  //     const { ethereum } = window;
  //     if (ethereum) {
  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const signer = provider.getSigner();
  //       const tweetContract = new ethers.Contract(
  //         contractAddress,
  //         contractABI,
  //         signer
  //       );
  //       const tweets = await tweetContract.getTweet();
  //       const tweetsCleaned = tweets.map((tweet) => {
  //         return {
  //           address: tweet.address,
  //           timestamp: new Date(tweet.timestamp * 1000),
  //           message: tweet.message,
  //         };
  //       });
  //       setAllTweets(tweetsCleaned);
  //     } else {
  //       console.log("Ethereum object doesn't exist!");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };


  useEffect(() => {
    let twitterContract;

    const onNewEvent = (from, message, timestamp) => {
      console.log("New Event", from, message, timestamp);
      setAllTweets((prevState) => [
        ...prevState,
        {
          address: from,
          message: message,
          timestamp: new Date(timestamp * 1000),
        }],
      )
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      twitterContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      twitterContract.on("NewTweet", onNewEvent);
      return () => {
        if (twitterContract) {
          twitterContract.off("NewTweet", onNewEvent)
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
      // getTweet();
    } catch (error) {
      console.log(error);
    }
  };

  const postTweet = async () => {
    try {
      if (!loading) {
        setSuccess(false);
        setLoading(true);
      }
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
      } else {
        console.log("Ethereum object doesn't exist!");
      }
      if (loading) {
        setSuccess(true);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => { checkIfWalletIsConnected(); }, []);
  return (
    <div className="App">
      <Box mt={4}>
        {currentAccount && (
          <TextField sx={{ width: '20%' }} id="standard-basic" label="contents"  onChange={(event) => {
            setMessageValue(event.target.value);
          }} />
        )}
      </Box>
      <Box mt={4}>
        {currentAccount && (
        <Button
          variant="contained"
          onClick={() => {
            postTweet(messageValue);
          }}
        >
          POST
        </Button>
        )}
      </Box>
      {/* {currentAccount && (
        <Box sx={{ m: 1, position: 'relative' }}>
          <Button
            variant="contained"
            sx={buttonSx}
            disabled={loading}
            onClick={postTweet(messageValue)}
          >
            Accept terms
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                color: green[500],
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      )} */}
      <Box mt={4}>
      {currentAccount && (
        allTweets.slice(0).reverse().map(
          (tweet, index) => {
            return (
              <div key={index} style={{ backgroundColor: '#F8F8FF', marginTop: "16px", padding: "8px" }}>
                <div>Address: {tweet.address}</div>
                <div>Message: {tweet.message}</div>
                <div>Timestamp: {tweet.timestamp.toString()}</div>
              </div>
            )
          }
        )
        )}
      </Box>
      <Box mt={4}>
        {!currentAccount && (
          <Button variant="contained" onClick={connectWallet}>Connect Wallet</Button>
      )}
        {currentAccount && (
          <Button variant="contained" onClick={connectWallet}>Wallet Connected</Button>
        )}
      </Box>
    </div>
  );
}

export default App;
