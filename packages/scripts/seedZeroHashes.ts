import { seedZeroHashes } from './seeding';

async function main() {
  const dbEnv = process.env.DB_ENV as string;
  if (!dbEnv) {
    throw new Error('no dbEnv specified. It should be prod or dev');
  }
  const db =
    dbEnv === 'dev'
      ? 'CdkStack-dev-DynamoDBContinuumCE168742-T43BFABPMSO7'
      : 'CdkStack-prod-DynamoDBContinuumCE168742-MISXEN23ENKG';
  console.log('DB:', db);

  const result = await seedZeroHashes(db);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
