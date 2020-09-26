import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import ethers from 'ethers'

export default function Home() {
  const  [apis, setApis] = useState()
  const [address, setAddress] = useState()

  useEffect(() => {
     (async () => {
       const zksync = await import('zksync')
       const syncProvider = await zksync.getDefaultProvider("mainnet")

       await window.ethereum.enable()
       const ethersProvider = new ethers.providers.Web3Provider(window.ethereum)
       const ethersSigner = ethersProvider.getSigner()
       //const ethWallet = ethers.Wallet.fromEthSigner(ethersSigner, ethersProvider)
       const syncWallet = await zksync.Wallet.fromEthSigner(ethersSigner, syncProvider)
       const accounts = await ethersProvider.listAccounts()
       setAddress(accounts[0])
       setApis({zksync, ethersProvider, ethersSigner, syncWallet})
       console.log(apis)
    })()
  }, [])



  return (
    <div className={styles.container}>
      <Head>
        <title>zkSync QRCode Reader</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {apis ? <main className={styles.main}>
        <h3>Your Address</h3>
        <div>{address}</div>
      </main> : 'Loading...'}
    </div>
  )
}
