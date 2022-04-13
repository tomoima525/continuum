import { seedZeroHashes } from './seeding';

async function main() {
  const result = await seedZeroHashes(
    'CdkStack-dev-DynamoDBMerkleTree8A62F92F-675JA7NPNV',
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
