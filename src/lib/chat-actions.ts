export function canWriteChat(busy: boolean, conversationId: string | null, lockedIds: string[]) {
  return !busy && (!conversationId || !lockedIds.includes(conversationId));
}

// Editing creates a new branch: the original conversation is never deleted.
export function historyBeforeEdit<T extends { id: string }>(messages: T[], messageId: string): T[] | null {
  const index = messages.findIndex(message => message.id === messageId);
  return index < 0 ? null : messages.slice(0, index);
}

export function buildRegenerationPrompt(original: string, instruction: string) {
  const refinement = instruction.trim();
  return refinement
    ? `${original}\n\nPlease revise your answer using these changes:\n${refinement}`
    : original;
}