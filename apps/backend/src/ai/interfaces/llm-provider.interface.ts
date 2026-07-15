import { AIMessage, BaseMessage } from "@langchain/core/messages";

export interface LLMProvider {
    invoke(messages: BaseMessage[]): Promise<AIMessage>;
}