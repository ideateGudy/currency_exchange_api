export type Country = {
    id: string;
    name: string;
    capital: string;
    region: string;
    population: number;
    currency_code: string;
    exchange_rate: number;
    estimated_gdp: number;
    flag_url: string;
    last_refreshed_at: Date;
};
export interface CountryInterface {
    name: string;
    capital?: string;
    region?: string;
    population: number;
    currency_code: string;
    exchange_rate: number;
    estimated_gdp: number;
    flag_url?: string;
    last_refreshed_at: Date;
};