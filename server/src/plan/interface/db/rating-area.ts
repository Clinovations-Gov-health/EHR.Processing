const RatingAreaMarkets = ["individual", "small group", "both"] as const;
export type RatingAreaMarket = typeof RatingAreaMarkets[number];

export interface RatingAreaModel {
    state: string;
    ratingAreaId: string;
    market: RatingAreaMarket;
    zipcodes: string[]
}