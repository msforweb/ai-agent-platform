import { MessagesAnnotation } from "@langchain/langgraph";

export const GraphState = MessagesAnnotation;

export type GraphStateType = typeof GraphState.State;