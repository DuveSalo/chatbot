function processQueue(messages) {
  const result = messages.map((message) => message.text).join(' ');
  console.log('Accumulated messages:', result);
  return result;
}

function createMessageQueue(config) {
  const { gapMilliseconds, maxQueueSize = 10 } = config;
  const state = { queues: new Map() };

  function processUserQueue(from) {
    const currentQueue = state.queues.get(from);
    if (currentQueue?.messages.length) {
      const result = processQueue(currentQueue.messages);
      currentQueue.callback?.(result, from);
      state.queues.set(from, { messages: [], timer: null, callback: null });
    }
  }

  return function enqueueMessage(ctx, callback) {
    const from = ctx.from;
    const messageBody = ctx.body;

    if (!from || !messageBody) {
      console.error('Invalid message context:', ctx);
      return;
    }

    let userQueue = state.queues.get(from) || { messages: [], timer: null, callback: null };
    if (userQueue.messages.length >= maxQueueSize) {
      userQueue.messages.shift(); // Elimina el mensaje más antiguo
    }

    userQueue.messages.push({ text: messageBody, timestamp: Date.now() });
    userQueue.callback = callback;

    if (userQueue.timer) {
      clearTimeout(userQueue.timer); // Limpia el timer anterior
    }

    userQueue.timer = setTimeout(() => processUserQueue(from), gapMilliseconds);
    state.queues.set(from, userQueue);
  };
}

export { createMessageQueue };