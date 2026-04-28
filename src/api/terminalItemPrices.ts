import { fetchWithCache } from "./apiFetch";

export type TerminalItemPrice = {
  id_item: number;
  id_terminal: number;
  price_buy: number;
  price_sell?: number | null;
  date_modified: number;
};

export type TerminalItemPriceDictionary = Record<number, TerminalItemPrice>;

export async function fetchTerminalItemPrices(
  terminalId: string | number
): Promise<TerminalItemPriceDictionary> {
  const res = await fetchWithCache(
    `items_prices_terminal_${terminalId}`,
    `https://api.uexcorp.space/2.0/items_prices?id_terminal=${terminalId}`
  );

  return Object.fromEntries(
    res.data.map((item: TerminalItemPrice) => [item.id_item, item])
  );
}
