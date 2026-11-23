export function canWriteChat(busy: boolean, conversationId: string | null, lockedIds: string[]) {
  return !busy && (!conversationId || !lockedIds.includes(conversationId));
}

// Editing creates a new branch: the original conversation is never deleted.
export function historyBeforeEdit<T extends { id: string }>(messages: T[], messageId: string): T[] | null {
  const index = messages.findIndex(message => message.id === messageId);
  return index < 0 ? null : messages.slice(0, index);
}