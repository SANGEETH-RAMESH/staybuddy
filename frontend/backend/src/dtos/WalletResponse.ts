export interface IWalletResponse {
  type: "deposit" | "withdrawal";
  amount: number;
  date: Date;
  description: string;
}