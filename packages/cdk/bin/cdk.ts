#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { envSpecific } from '../lib/envSpecific';

const app = new cdk.App();
new CdkStack(app, envSpecific('CdkStack'), {});
