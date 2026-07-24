import {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
} from "@langchain/core/messages";

export interface LLMProvider {
  invoke(messages: BaseMessage[]): Promise<AIMessage>;

  stream(
    messages: BaseMessage[]
  ): AsyncGenerator<AIMessageChunk>;
}