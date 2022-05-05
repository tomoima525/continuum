import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Props {
  metadataUrl?: string;
  size: number;
}

const ipfsToNftLink = (ipfs: string) => {
  return ipfs
    .replace('ipfs://', 'https://nftstorage.link/ipfs/')
    .replace('#', '%23');
};
export const IPFSImage = (props: Props) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const getUrl = async () => {
      if (!mounted || !props?.metadataUrl) {
        return;
      }
      // https://nftstorage.link/ipfs/
      const nftLink = ipfsToNftLink(props.metadataUrl);
      const r = await (await fetch(nftLink)).json();
      setPhotoUrl(ipfsToNftLink(r.image));
    };
    getUrl();

    return () => {
      mounted = false;
    };
  }, [props.metadataUrl]);

  return (
    <Image
      className="rounded-xl"
      src={photoUrl || '/not-minted.jpg'}
      width={props.size}
      height={props.size}
      alt="img"
    />
  );
};
