export interface IBookmark {
  findPath(): Promise<string>;
  getUrls(): Promise<string[]>;
}
