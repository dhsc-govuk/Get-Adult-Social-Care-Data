export interface LocationNames {
  CPLabel: string | null;
  LALabel: string;
  RegionLabel: string;
  CountryLabel: string;
  // Optional: the header for the comparator group's average column on
  // benchmarked tables. When present the DataTable renders the column.
  ComparatorLabel?: string;
}
