import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { providers } from 'ethers';
import {
  Connector,
  InjectedConnector,
  Provider,
  chain,
  defaultChains,
  developmentChains,
} from 'wagmi';
import { NotificationProvider } from 'contexts/NotificationContext';
import type { AppProps } from 'next/app';
import { Seo } from 'components/ui/Seo';
import { ContentProvider } from 'contexts/ContentContext';

// Get environment variables
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID as string;
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID as string;

// Chains for connectors to support
// TODO: add harmony network
const chains = [...defaultChains];

// Set up providers
type ProviderConfig = { chainId?: number; connector?: Connector };
const isChainSupported = (chainId?: number) => {
  const supported = chains.some(x => x.id === chainId);
  console.log(supported, chainId);
  return supported;
};

const provider = ({ chainId }: ProviderConfig) =>
  providers.getDefaultProvider(
    isChainSupported(chainId) ? chainId : 'http://localhost:8545',
    {
      alchemy: alchemyId,
      infura: infuraId,
    },
  );
// Set up connectors
const connectors = ({ chainId }: { chainId?: number }) => {
  return [new InjectedConnector({ chains })];
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider connectors={connectors} provider={provider}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <ContentProvider>
          <NotificationProvider>
            <Seo
              imgHeight={768}
              imgWidth={1024}
              imgUrl="/proved-ogp.jpeg"
              path="https://usecontinuum.app"
              title="Continuum"
              pageDescription="Prove your work credentials with privacy."
            />
            <Component {...pageProps} />
          </NotificationProvider>
        </ContentProvider>
      </SessionProvider>
    </Provider>
  );
}

export default MyApp;
