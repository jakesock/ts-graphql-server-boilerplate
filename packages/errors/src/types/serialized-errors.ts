export interface IFormattedError {
  status: number;
  message: string;
  field?: string;
}
export type SerializedErrors = IFormattedError[];
