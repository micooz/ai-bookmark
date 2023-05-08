export interface ILLM {
  buildPrompt(context: string, question: string): Promise<string>;
  ask(question: string): Promise<string>;
}
