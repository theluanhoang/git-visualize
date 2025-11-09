export const SocketEvents = {
  CLIENT_TO_SERVER: {
    SUBSCRIBE_LESSON: 'subscribe-lesson',
    UNSUBSCRIBE_LESSON: 'unsubscribe-lesson',
  },
  SERVER_TO_CLIENT: {
    ERROR: 'error',
    RATING_CREATED: 'rating:created',
    RATING_UPDATED: 'rating:updated',
    RATING_DELETED: 'rating:deleted',
    STATS_UPDATED: 'stats:updated',
  },
} as const;

export type SocketEvent = 
  | typeof SocketEvents.CLIENT_TO_SERVER[keyof typeof SocketEvents.CLIENT_TO_SERVER]
  | typeof SocketEvents.SERVER_TO_CLIENT[keyof typeof SocketEvents.SERVER_TO_CLIENT];

