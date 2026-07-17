export type DailyPhrase = {
  id: string;
  text: string;
  active?: boolean;
};

export const dailyPhrases = [
  { id: "presence", text: "Um lugar para chegar como você está.", active: true },
  { id: "time", text: "Seu tempo também merece cuidado.", active: true },
  { id: "listening", text: "Escutar a si pode abrir novos caminhos.", active: true },
] as const satisfies readonly DailyPhrase[];

export async function getDailyPhrases(): Promise<readonly DailyPhrase[]> {
  return dailyPhrases;
}
