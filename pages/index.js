import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import ethers from 'ethers'

export default function Home() {
  const  [apis, setApis] = useState()
  const [data, setData] = useState()

  // load apis
  useEffect(() => {
     (async () => {
       const zksync = await import('zksync')
       const syncProvider = await zksync.getDefaultProvider("mainnet")

       await window.ethereum.enable()
       const ethersProvider = new ethers.providers.Web3Provider(window.ethereum)
       const ethersSigner = ethersProvider.getSigner()
       //const ethWallet = ethers.Wallet.fromEthSigner(ethersSigner, ethersProvider)
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
            // ETH and DAI happen to have the same amount of decimals,
            // so this should be modified to support other tokens that may not have the same amount.
            {token}: {ethers.utils.formatEther(balance).toString()}
          </div>)}
          <h4>Not verified yet</h4>
          {Object.entries(data.committedBalances).map(([token, balance]) => <div>
            {token}: {ethers.utils.formatEther(balance).toString()}
          </div>)}
        </div>}

      </main> : 'Loading...'}
    </div>
  )
}
