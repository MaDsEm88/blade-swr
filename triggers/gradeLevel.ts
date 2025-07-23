// triggers/gradeLevel.ts
import type { AddTrigger, SetTrigger, RemoveTrigger } from 'blade/types';

// Trigger for creating grade levels
export const add: AddTrigger = (query) => {
  // Ensure query.with exists
  if (!query.with) {
    return query;
  }

  // Handle both single object and array cases
  const processGradeLevelData = (gradeLevelData: any) => {
    console.log('Grade Level creation trigger - processing data:', gradeLevelData);

    // Auto-generate code if not provided
    if (!gradeLevelData.code && gradeLevelData.name) {
      // Generate code from name (e.g., "9th Grade" -> "9", "Beginner" -> "BEG")
      let code = gradeLevelData.name.toString();

      // Check if it's a traditional grade (contains "Grade")
      if (code.includes('Grade')) {
        const match = code.match(/(\d+)/);
        if (match) {
          code = match[1];
        }
      } else {
        // For non-traditional grades, use first 3 letters uppercase
        code = code.substring(0, 3).toUpperCase();
      }

      gradeLevelData.code = code;
    }

    // Set default sort order if not provided
    if (gradeLevelData.sortOrder === undefined || gradeLevelData.sortOrder === null) {
      // For traditional grades, use the numeric value
      if (gradeLevelData.code && /^\d+$/.test(gradeLevelData.code.toString())) {
        gradeLevelData.sortOrder = parseInt(gradeLevelData.code.toString());
      } else {
        // For non-traditional grades, use a high number to put them at the end
        gradeLevelData.sortOrder = 1000;
      }
    }

    // Ensure required fields
    gradeLevelData.isActive = gradeLevelData.isActive !== false; // Default to true
    gradeLevelData.createdAt = new Date();
    gradeLevelData.updatedAt = new Date();

    console.log('Grade Level creation trigger - processed data:', gradeLevelData);

    return gradeLevelData;
  };

  // Handle array of grade levels
  if (Array.isArray(query.with)) {
    query.with = query.with.map(processGradeLevelData);
  } else {
    // Handle single grade level
    query.with = processGradeLevelData(query.with);
  }

  return query;
};

// Trigger for updating grade levels
export const set: SetTrigger = (query) => {
  // Ensure query.to exists
  if (!query.to) {
    return query;
  }

  // Update timestamp
  (query.to as any)['updatedAt'] = new Date();

  console.log('Grade Level update trigger - processed data:', query.to);

  return query;
};

// Trigger for removing grade levels
export const remove: RemoveTrigger = (query) => {
  // Add any validation or cleanup logic for deletions
  console.log('Grade Level removal trigger called with query:', query);
  return query;
};

// Trigger to run after grade level creation (synchronous)
export const afterAdd = async (query: any, _multiple: any, _options: any) => {
  const gradeLevelData = query.with;

  if (!gradeLevelData) {
    return [];
  }

  console.log('🎓 Grade Level afterAdd trigger called for:', gradeLevelData.name);

  // Here you could add logic to:
  // - Send notifications
  // - Update related records
  // - Log the creation

  return [];
};


