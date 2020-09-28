import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import ethers from 'ethers'
import { ThemeProvider, Box, Input, Label, Button } from 'theme-ui'
import theme from '@makerdao/dai-ui-theme-maker-neue'

const SendForm = ({apis}) => {
  const [address, setAddress] = useState()
  const [amount, setAmount] = useState()

  const send = async () => {
    const {zksync, syncWallet} = apis

    const parsedAmount = zksync.utils.closestPackableTransactionAmount(
      ethers.utils.parseEther(amount))
    const fee = zksync.utils.closestPackableTransactionFee(
      ethers.utils.parseEther("0.05"))

    const transfer = await syncWallet.syncTransfer({
      to: address,
      token: "DAI",
      amount: parsedAmount,
      fee,
    });

    const transferReceipt = await transfer.awaitReceipt();
    console.log(transferReceipt)
  }

  return <Box>
    <h2>Send DAI over zkSync</h2>
    <Box>
      <Label>Ethereum Address</Label>
      <Input value={address} onChange={event => {setAddress(event.target.value)}}/>
    </Box>
    <Box>
      <Label>DAI Amount</Label>
      <Input value={amount} onChange={event => {setAmount(event.target.value)}} />
    </Box>
    <Box>
      <Button
        style={{margin: '25px 0 0 0'}}
        onClick={() => send()} disabled={!apis}>Send</Button>
    </Box>
  </Box>
}

export default function Home() {
  const [apis, setApis] = useState()
  const [data, setData] = useState()

  // load apis
  useEffect(() => {
     (async () => {
       const zksync = await import('zksync')
       const syncProvider = await zksync.getDefaultProvider("mainnet")

       await window.ethereum.enable()
       const ethersProvider = new ethers.providers.Web3Provider(window.ethereum)
       const ethersSigner = ethersProvider.getSigner()
       const syncWallet = await zksync.Wallet.fromEthSigner(ethersSigner, syncProvider)

       setApis({zksync, ethersProvider, ethersSigner, syncWallet})
       console.log(apis)
    })()
  }, [])

  // get data using apis
  useEffect(() => {
    if (!apis) {
      return
    }
    (async () => {
      const state = await apis.syncWallet.getAccountState();

      // Committed state is not final yet
      const committedBalances = state.committed.balances;
      // Verified state is final
      const verifiedBalances = state.verified.balances;

      setData({committedBalances, verifiedBalances})
    })()
  }, [apis])

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.container}>
        <Head>
          <title>zkSync QRCode Reader</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {apis ? <main className={styles.main}>
          <h3>Your Address</h3>
          <div>{apis.syncWallet.address()}</div>
          <h3>Balances in Layer 2</h3>
          {data && <div>
            {Object.entries(data.verifiedBalances).map(([token, balance]) => <div>
              {/*
               ETH and DAI happen to have the same amount of decimals,
               so this should be modified to support other tokens that may not have the same amount.
              */}
              {token}: {ethers.utils.formatEther(balance).toString()}
            </div>)}
            <h4>Not verified yet</h4>
            {Object.entries(data.committedBalances).map(([token, balance]) => <div>
              {token}: {ethers.utils.formatEther(balance).toString()}
            </div>)}
          </div>}
          <SendForm apis={apis} />
        </main> : 'Loading...'}
      </div>
    </ThemeProvider>
  )
}
