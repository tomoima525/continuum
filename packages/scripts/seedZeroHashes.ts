import { seedZeroHashes } from './seeding';

async function main() {
  const result = await seedZeroHashes(
    'CdkStack-dev-DynamoDBContinuumCE168742-T43BFABPMSO7',
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
