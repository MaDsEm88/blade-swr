// scripts/create-test-user.js
// Simple script to create a test user for authentication testing

import { authClient } from '../lib/auth-client.js';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const result = await authClient.signUp.email({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'testpass',
    });

    if (result.error) {
      console.error('Error creating test user:', result.error);
      return;
    }

    console.log('Test user created successfully!');
    console.log('Email: testuser@example.com');
    console.log('Password: testpass');
    console.log('User data:', result.data);
    
  } catch (error) {
    console.error('Failed to create test user:', error);
  }
}

// Run the script
createTestUser();
