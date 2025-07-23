// Student data interface
export interface StudentData {
  name: string;
  email: string;
  classes: string[];
  shareWithOtherTeachers: boolean;
}

// Student interface for display
export interface Student {
  id: number;
  name: string;
  email: string;
  classes: string[];
  status: 'Active' | 'Inactive';
}

// Class interface
export interface ClassItem {
  name: string;
  studentCount: number;
  maxCapacity: number;
}
