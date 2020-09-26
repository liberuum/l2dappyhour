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
      // Committed state is not final yet
      const committedETHBalance = await apis.syncWallet.getBalance("ETH");
      // Verified state is final
      const verifiedETHBalance = await apis.syncWallet.getBalance("ETH", "verified");

      setData({committedETHBalance, verifiedETHBalance})
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
          ETH: {data.verifiedETHBalance.toString()}
        </div>}

      </main> : 'Loading...'}
    </div>
  )
}
