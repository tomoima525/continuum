// work around to run in node16
// https://github.com/alixaxel/chrome-aws-lambda/issues/268
process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodejs14.x';
import chrome from 'chrome-aws-lambda';
export default chrome;
