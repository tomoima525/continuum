import { WalletLogo } from 'components/ui/WalletLogo';
import { shortenName } from 'utils/userName';

type Props = {
  criteria?: string;
  walletname?: string;
};

export default function Content({
  criteria = 'Your github account',
  walletname = '0x123456789',
}: Props) {
  const isLong = criteria.length > 15;
  return (
    <div className="flex flex-col">
      <p
        className={`${
          isLong ? 'text-2xl' : 'text-4xl'
        } font-semibold mb-2 mt-3`}
      >
        <span className={'flex items-center rounded relative'}>{criteria}</span>
      </p>
      <div className="text-2xl">
        <span className={'flex items-center relative'}>
          <WalletLogo />
          <div className="px-2">{shortenName(walletname)}</div>
        </span>
      </div>
    </div>
  );
}
