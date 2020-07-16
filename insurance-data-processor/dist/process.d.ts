import 'data-forge-fs';
import { InsuranceSchema } from './interface/db/insurance';
export declare function preprocess(inputFilePath: string, outputFilePath: string): void;
export declare function convert(inputFilePath: string): Promise<InsuranceSchema[]>;
