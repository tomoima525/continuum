import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from './certificate.module.css';
import Certificate from './Certificate';

export default function TicketImage() {
  const { query } = useRouter();
  return (
    <div className={styles.background}>
      <div className={styles.page}>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap"
            rel="stylesheet"
          />
        </Head>
        <Certificate
          walletname={query.walletname as string}
          criteria={query.criteria as string}
        />
      </div>
    </div>
  );
}
