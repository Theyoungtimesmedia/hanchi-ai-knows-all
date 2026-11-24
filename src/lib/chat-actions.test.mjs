import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canWriteChat, historyBeforeEdit } from './chat-actions';

describe('chat actions', () => {
  it('prevents writes in a locked conversation', () => {
    assert.equal(canWriteChat(false, 'locked-chat', ['locked-chat']), false);
    assert.equal(canWriteChat(false, 'other-chat', ['locked-chat']), true);
    assert.equal(canWriteChat(true, 'other-chat', []), false);
  });
  it('keeps only preceding context in an edited branch without changing the original', () => {
    const messages = [{ id: 'first', content: 'Hi' }, { id: 'edited', content: 'Old prompt' }, { id: 'answer', content: 'Old answer' }];
    assert.deepEqual(historyBeforeEdit(messages, 'edited'), [{ id: 'first', content: 'Hi' }]);
    assert.equal(messages.length, 3);
    assert.equal(messages[1].content, 'Old prompt');
    assert.equal(historyBeforeEdit(messages, 'missing'), null);
  });
});