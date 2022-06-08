// From https://github.com/vplasencia/zkGames/blob/main/zkgames-ui/utils/switchNetwork.js
import networks from './networks.json';
import { selectedChain } from './selectedChain';

export const switchNetwork = async () => {
  if (window.ethereum) {
    try {
      // Try to switch to the chain
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(selectedChain).toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${parseInt(selectedChain).toString(16)}`,
                chainName: networks[selectedChain].chainName,
                rpcUrls: networks[selectedChain].rpcUrls,
                nativeCurrency: {
                  name: networks[selectedChain].nativeCurrency.name,
                  symbol: networks[selectedChain].nativeCurrency.symbol,
                  decimals: 18,
                },
                blockExplorerUrls: networks[selectedChain].blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          console.log(addError);
        }
      }
      // handle other "switch" errors
    }
  } else {
    // If window.ethereum is not found then MetaMask is not installed
    alert(
      'MetaMask is not installed. Please install it to use this app: https://metamask.io/download/',
    );
  }
};
