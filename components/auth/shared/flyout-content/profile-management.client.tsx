'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../../lib/utils';
import { useSimpleSession } from '../../../../lib/auth-client';
import { useUserInitials } from '../../../../hooks/useAvatarUpdate';

// Helper function to get image URL from various formats
const getImageUrl = (image: any): string | undefined => {
  if (!image) return undefined;
  if (typeof image === 'string') return image;
  if (typeof image === 'object' && 'src' in image) return image.src;
  return undefined;
};
import { 
  User, 
  Mail, 
  Shield, 
  AtSign,
  Edit3,
  Save,
  X,
  Check
} from 'lucide-react';

interface ProfileManagementProps {
  className?: string;
}

export function ProfileManagement({ className }: ProfileManagementProps) {
  const { session } = useSimpleSession();
  const user = session?.user;
  const userInitials = useUserInitials(user?.name);

  // Debug: Log user image data
  console.log('🖼️ ProfileManagement - User image data:', {
    hasUser: !!user,
    imageType: typeof user?.image,
    imageValue: user?.image,
    imageUrl: getImageUrl(user?.image)
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);



  // Handle name edit
  const handleStartEdit = useCallback(() => {
    setEditedName(user?.name || '');
    setIsEditing(true);
  }, [user?.name]);

  const handleCancelEdit = useCallback(() => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  }, [user?.name]);

  const handleSaveEdit = useCallback(async () => {
    if (!user || editedName.trim() === user.name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement name update mutation
      console.log('Saving name update:', editedName.trim());
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update name:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, editedName]);

  if (!user) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <p className="text-white/70">Loading profile...</p>
      </div>
    );
  }

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student';
      case 'teacher': return 'Teacher';
      case 'school_admin': return 'School Administrator';
      default: return role;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'text-blue-400';
      case 'teacher': return 'text-green-400';
      case 'school_admin': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={cn("p-4 h-full", className)}>
      <div className="text-white">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-blue-400" />
          <h3 className="text-lg font-semibold">Profile Settings</h3>
        </div>

        {/* Avatar Section */}
        <div className="mb-6">
          <div className="flex flex-col items-center gap-4">
            
            
          </div>
        </div>

        {/* User Information */}
        <div className="space-y-4">
          {/* Name Field */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-white/70" />
                <span className="text-sm font-medium text-white/90">Full Name</span>
              </div>
              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Edit3 className="h-3 w-3 text-white/70" />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                  placeholder="Enter your full name"
                  disabled={isSaving}
                />
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || editedName.trim() === user.name}
                  className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 rounded transition-colors"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save className="h-3 w-3 text-white" />
                    </motion.div>
                  ) : (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="p-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 rounded transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ) : (
              <p className="text-white">{user.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-white/70" />
              <span className="text-sm font-medium text-white/90">Email Address</span>
            </div>
            <p className="text-white">{user.email}</p>
            <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
          </div>

          {/* Username Field (for students) */}
          {user.role === 'student' && (user as any).username && (
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AtSign className="h-4 w-4 text-white/70" />
                <span className="text-sm font-medium text-white/90">Username</span>
              </div>
              <p className="text-white">{(user as any).username}</p>
              <p className="text-xs text-white/50 mt-1">Username assigned by your teacher</p>
            </div>
          )}

          {/* Role Field */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-white/70" />
              <span className="text-sm font-medium text-white/90">Role</span>
            </div>
            <p className={cn("font-medium", getRoleColor(user.role))}>
              {getRoleDisplayName(user.role)}
            </p>
          </div>

          {/* Account Status */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90 mb-1">Account Status</p>
                <p className="text-xs text-white/70">
                  Created {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
