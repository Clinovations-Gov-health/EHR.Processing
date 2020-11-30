export interface Claim {
    starts: Date;
    ends: Date;
    diagnoses: { name: string; code: number; }[];
    totalCost: number;
}