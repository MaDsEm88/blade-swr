// triggers/session.ts
import type { AddTrigger, SetTrigger, RemoveTrigger } from 'blade/types';

// Trigger for creating sessions
export const add: AddTrigger = (query) => {
  // Ensure query.with exists
  if (!query.with) {
    return query;
  }

  // Handle both single object and array cases
  const processSessionData = (sessionData: any) => {
    // Set default timestamps
    sessionData.createdAt = new Date();
    sessionData.updatedAt = new Date();

    // Set default expiration (24 hours from now)
    if (!sessionData.expiresAt) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      sessionData.expiresAt = expiresAt;
    }

    return sessionData;
  };

  // Handle array of sessions
  if (Array.isArray(query.with)) {
    query.with = query.with.map(processSessionData);
  } else {
    // Handle single session
    query.with = processSessionData(query.with);
  }

  return query;
};

// Trigger for updating sessions
export const set: SetTrigger = (query) => {
  // Ensure query.to exists
  if (!query.to) {
    return query;
  }

  // Update timestamp
  (query.to as any)['updatedAt'] = new Date();

  return query;
};

// Trigger for getting sessions (validation)
export const get: GetTrigger = async (query, multiple, options) => {
  // If we're getting a session, validate that the associated user still exists
  const result = await options.client.get.sessions(query);

  if (result && !Array.isArray(result)) {
    // Single session - check if user exists
    if (result.userId) {
      try {
        const user = await options.client.get.user.with.id(result.userId);
        if (!user) {
          // User doesn't exist, remove the orphaned session
          console.log('Removing orphaned session for deleted user:', result.userId);
          await options.client.remove.session.with.id(result.id);
          return null;
        }
      } catch (error) {
        console.error('Error validating session user:', error);
        // If we can't validate, remove the session to be safe
        await options.client.remove.session.with.id(result.id);
        return null;
      }
    }
  } else if (Array.isArray(result)) {
    // Multiple sessions - filter out orphaned ones
    const validSessions = [];
    for (const session of result) {
      if (session.userId) {
        try {
          const user = await options.client.get.user.with.id(session.userId);
          if (user) {
            validSessions.push(session);
          } else {
            // Remove orphaned session
            console.log('Removing orphaned session for deleted user:', session.userId);
            await options.client.remove.session.with.id(session.id);
          }
        } catch (error) {
          console.error('Error validating session user:', error);
          // Remove session if we can't validate
          await options.client.remove.session.with.id(session.id);
        }
      } else {
        validSessions.push(session);
      }
    }
    return validSessions;
  }

  return result;
};

// Trigger for removing sessions (cleanup)
export const remove: RemoveTrigger = (query) => {
  // Add any cleanup logic here if needed
  return query;
};