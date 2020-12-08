export interface Claim {
    starts: Date;
    ends: Date;
    procCode: string;
    typeOfService: string;
    amountBilled: number;
    planPaid: number;
    responsibility: number;
}