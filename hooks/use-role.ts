'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { ROLES } from '@/lib/constants/roles';

/**
 * Custom hook for role-based access control
 * Provides utilities for checking user roles and permissions
 */
export function useRole() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const isAdmin = user?.role === ROLES.ADMIN;
  const isUser = user?.role === ROLES.USER;

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => user?.role === role);
  };

  /**
   * Check if user has all of the specified roles
   * (Currently users only have one role, but this is for future extensibility)
   */
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => user?.role === role);
  };

  return {
    user,
    role: user?.role,
    isLoading,
    isAuthenticated,
    isAdmin,
    isUser,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
}

/**
 * HOC for protecting components based on roles
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string | string[],
  fallback?: React.ReactNode
) {
  return function ProtectedComponent(props: P) {
    const { hasRole, hasAnyRole, isLoading } = useRole();

    if (isLoading) {
      return React.createElement('div', null, 'Loading...');
    }

    const hasAccess = Array.isArray(requiredRole)
      ? hasAnyRole(requiredRole)
      : hasRole(requiredRole);

    if (!hasAccess) {
      return fallback ? React.createElement(React.Fragment, null, fallback) : null;
    }

    return React.createElement(Component, props);
  };
}