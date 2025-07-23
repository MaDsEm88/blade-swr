// triggers/educationalContext.ts
import type { AddTrigger, SetTrigger, RemoveTrigger } from 'blade/types';

// Trigger for creating educational contexts
export const add: AddTrigger = (query) => {
  // Ensure query.with exists
  if (!query.with) {
    return query;
  }

  // Handle both single object and array cases
  const processEducationalContextData = (contextData: any) => {
    console.log('Educational Context creation trigger - processing data:', contextData);

    // Ensure required fields
    contextData.isActive = contextData.isActive !== false; // Default to true
    contextData.createdAt = new Date();
    contextData.updatedAt = new Date();

    // Parse and validate defaultGradeLevels if provided
    if (contextData.defaultGradeLevels && typeof contextData.defaultGradeLevels === 'string') {
      try {
        const parsed = JSON.parse(contextData.defaultGradeLevels);
        if (Array.isArray(parsed)) {
          contextData.defaultGradeLevels = JSON.stringify(parsed);
        } else {
          contextData.defaultGradeLevels = JSON.stringify([]);
        }
      } catch (error) {
        console.error('Error parsing defaultGradeLevels:', error);
        contextData.defaultGradeLevels = JSON.stringify([]);
      }
    } else {
      contextData.defaultGradeLevels = JSON.stringify([]);
    }

    console.log('Educational Context creation trigger - processed data:', contextData);

    return contextData;
  };

  // Handle array of educational contexts
  if (Array.isArray(query.with)) {
    query.with = query.with.map(processEducationalContextData);
  } else {
    // Handle single educational context
    query.with = processEducationalContextData(query.with);
  }

  return query;
};

// Trigger for updating educational contexts
export const set: SetTrigger = (query) => {
  // Ensure query.to exists
  if (!query.to) {
    return query;
  }

  // Update timestamp
  (query.to as any)['updatedAt'] = new Date();

  console.log('Educational Context update trigger - processed data:', query.to);

  return query;
};

// Trigger for removing educational contexts
export const remove: RemoveTrigger = (query) => {
  // Add any validation or cleanup logic for deletions
  console.log('Educational Context removal trigger called with query:', query);
  return query;
};

// Trigger to run after educational context creation (synchronous)
export const afterAdd = async (query: any, _multiple: any, _options: any) => {
  const contextData = query.with;

  if (!contextData) {
    return [];
  }

  console.log('🏫 Educational Context afterAdd trigger called for:', contextData.name);
  
  // Here you could add logic to:
  // - Create default grade levels for this context
  // - Send notifications
  // - Update related records
  
  return [];
};
