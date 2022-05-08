import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { providers } from 'ethers';
import { createClient, Provider } from 'wagmi';
import { NotificationProvider } from 'contexts/NotificationContext';
import type { AppProps } from 'next/app';
import { Seo } from 'components/ui/Seo';
import { ContentProvider } from 'contexts/ContentContext';
import networks from '../utils/networks.json';

// Chains for connectors to support
// https://docs.harmony.one/home/developers/network-and-faucets
const env = process.env.NEXT_PUBLIC_ENV as string;
// falls back to dev
const selectedChain =
  env === 'prod' ? networks[1666600000].chainId : networks[1666700000].chainId;

const provider = providers.getDefaultProvider(
  networks[selectedChain].rpcUrls[0],
);

const client = createClient({
  autoConnect: true,
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider client={client}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <ContentProvider>
          <NotificationProvider>
            <Seo
              imgHeight={768}
              imgWidth={1024}
              imgUrl="/continuum-ogp.png"
              path="https://continuum-swart.vercel.app/"
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
