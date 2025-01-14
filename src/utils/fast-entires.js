
function processQueue(messages) {
  const result = messages.map(message => message.text).join(" ");
  console.log('Accumulated messages:', result);
  return result;
}

function createMessageQueue(config) {
  let state = {
      queues: new Map()
  };

  function processUserQueue(from) {
      const currentQueue = state.queues.get(from);
      if (currentQueue) {
          const result = processQueue(currentQueue.messages);
          if (currentQueue.callback) {
              currentQueue.callback(result, from);
          }
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

      console.log('Enqueueing:', messageBody, 'from:', from);

      let userQueue = state.queues.get(from);
      if (!userQueue) {
          userQueue = { messages: [], timer: null, callback: null };
          state.queues.set(from, userQueue);
      }

      userQueue.messages.push({ text: messageBody, timestamp: Date.now() });
      userQueue.callback = callback;

      console.log('Messages for', from, ':', userQueue.messages);

      if (userQueue.timer) {
          clearTimeout(userQueue.timer);
      }

      userQueue.timer = setTimeout(() => {
          processUserQueue(from);
      }, config.gapMilliseconds);

      // Procesar inmediatamente si no hay un temporizador activo
      if (userQueue.messages.length === 1) {
          processUserQueue(from);
      }
  };
}

export { createMessageQueue };
