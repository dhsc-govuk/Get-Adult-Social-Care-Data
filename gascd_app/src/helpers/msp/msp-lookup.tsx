export interface MSPItem {
  url: string;
}

export interface MSPItems {
  [la_code: string]: MSPItem;
}

export const MSPLookup: MSPItems = {
  testla1: {
    url: 'https://www.hartlepool.gov.uk/info/20076/adults_and_older_people/552/market_position_statement_2016',
  },
};
