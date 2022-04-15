import '../styles/globals.css';
import { providers } from 'ethers';
import { InjectedConnector, Provider, chain } from 'wagmi';
import { NotificationProvider } from 'contexts/NotificationContext';
import { UserContextProvider } from 'contexts/UserContext';
import type { AppProps } from 'next/app';
import { Networkish } from '@ethersproject/networks';
import { Seo } from 'components/ui/Seo';

// Chains for connectors to support
const chains =
  process.env.NEXT_PUBLIC_BUILD_ENV === 'dev'
    ? [chain.rinkeby]
    : [chain.polygonMainnet];
// const infuraId = process.env.NEXT_PUBLIC_INFURA_KEY;

const network: Networkish =
  process.env.NEXT_PUBLIC_BUILD_ENV === 'dev' ? 'rinkeby' : 'matic';

const provider = ({ chainId }: { chainId?: number }) =>
  new providers.AlchemyProvider(network, process.env.NEXT_PUBLIC_ALCHEMY_KEY);

// Set up connectors
const connectors = ({ chainId }: { chainId?: number }) => {
  return [new InjectedConnector({ chains })];
};
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider connectors={connectors} provider={provider}>
      <UserContextProvider>
        <NotificationProvider>
          <Seo
            imgHeight={768}
            imgWidth={1024}
            imgUrl="/proved-ogp.jpeg"
            path="https://usecontinuum.app"
            title="Proved"
            pageDescription="Prove your work credentials with privacy."
          />
          <Component {...pageProps} />
        </NotificationProvider>
      </UserContextProvider>
    </Provider>
  );
}

export default MyApp;
