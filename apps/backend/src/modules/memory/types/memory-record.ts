export interface MemoryRecord {
  id: string;
  conversationId: string;
  content: string;
  embedding: number[];
  createdAt: Date;
}