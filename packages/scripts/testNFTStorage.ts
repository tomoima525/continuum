import { screenshot } from './utils/screenshot';
import { NFTStorage, File } from 'nft.storage';
// import { Blob } from 'buffer';

async function storeNFT({
  imageBuffer,
  name,
  fileName,
  description,
  token,
}: {
  imageBuffer: Buffer;
  name: string;
  fileName: string;
  description: string;
  token: string;
}) {
  const image = new File([imageBuffer], fileName, { type: 'image/png' });
  console.log('===== file ', image.name, image.size);
  // create a new NFTStorage client using our API key
  const nftstorage = new NFTStorage({ token });
  // call client.store, passing in the image & metadata
  return nftstorage.store({
    image,
    name,
    description,
  });
}

const handler = async function (
  address: string,
  groupId: string,
): Promise<any> {
  console.log('==== env', process.env.AWS_EXECUTION_ENV);
  try {
    const paramsObj = { walletname: address, criteria: 'Testing' };
    const searchParams = new URLSearchParams(paramsObj);
    const url = `https://continuum-swart.vercel.app/certificate?${searchParams.toString()}`;
    console.log('=====', url);
    const file = (await screenshot(url)) as Buffer;
    console.log(file.byteLength);
    const result = await storeNFT({
      description: 'NFT that proves the github reputation',
      fileName: `${address}_${groupId}`,
      imageBuffer: file,
      name: 'Continuum NFT',
      token: 'xxxxxxxxx',
    });

    console.log(result, result.data, result.ipnft, result.url);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (e) {
    return {
      statusCode: 404,
      body: JSON.stringify(e),
    };
  }
};

async function main() {
  const r = await handler(
    '0x123412341234',
    'Group#8f2cd5673434a49e4b4f52c2d68e8ec8',
  );
  console.log('===', r);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
