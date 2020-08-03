import { JSONSchema6Definition } from 'json-schema';

export interface RatingAreaDataModel {
    state: string;
    ratingAreaId: string;
    counties: string[];
    zipcodes: string[];
}

export const ratingAreaDataModelSchema: JSONSchema6Definition = {
    type: "object",
    properties: {
        state: { type: "string", minLength: 2, maxLength: 2 },
        ratingAreaId: { type: "string", minLength: 1, maxLength: 2 },
        counties: { type: "array", items: { type: "string" } },
        zipcodes: { type: "array", items: { type: "string", minLength: 3, maxLength: 3 }},
    },
    additionalProperties: false,
    required: ["state", "ratingAreaId", "counties", "zipcodes"],
};