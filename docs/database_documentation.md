# ConnectSphere Database Documentation

## Overview

This document provides comprehensive documentation for the ConnectSphere database implementation using Supabase. The database schema has been designed to store user profiles, preferences, and support relationship matching functionality.

## Supabase Configuration

- **Project URL:** https://jucwtfexhavfkhhfpcdv.supabase.co
- **Public Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo

## Database Schema

The database schema consists of a single `profiles` table that stores all user information. This table is linked to Supabase's built-in `auth.users` table via the user ID.

### Profiles Table Structure

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| username | TEXT | Unique username |
| birthdate | DATE | User's date of birth |
| gender | TEXT | User's gender |
| city | TEXT | User's location |
| bio | TEXT | User's self-description |
| interests | TEXT[] | Array of user's interests |
| relationship_types | TEXT[] | Array of relationship types the user is looking for |
| gender_preferences | TEXT[] | Array of genders the user is interested in |
| profile_image | TEXT | URL or Base64 string for profile image (future implementation) |
| created_at | TIMESTAMP WITH TIME ZONE | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Record update timestamp |

## Automatic Triggers

The database includes two automatic triggers:

### 1. Updated At Trigger

This trigger automatically updates the `updated_at` timestamp whenever a profile is modified.

### 2. New User Trigger

This trigger automatically creates a profile entry in the `profiles` table when a new user signs up through Supabase Auth. It extracts data from the user metadata and populates the profile fields.

## Data Flow

1. **User Registration**: When a user signs up through the signup form, their data is collected and sent to Supabase Auth.
2. **Profile Creation**: The `handle_new_user` trigger automatically creates a profile entry in the `profiles` table.
3. **Data Retrieval**: The application can retrieve and update this profile data as needed using the Supabase JavaScript client.

## JavaScript Integration

The application uses the following functions to interact with the database:

### `getUserProfile(userId)`

Retrieves a user's profile from the database. If the profile doesn't exist in the database, it falls back to user metadata.

### `createProfile(userId, profileData)`

Creates a new profile or updates an existing one in the database.

### `createOrUpdateUserProfilePreferences(userId, preferences)`

Updates user preferences in the database.

### `saveGenderPreferences(userId, genderPreferences)`

Updates gender preferences in the database.

## Row Level Security (RLS)

Currently, RLS is disabled for development purposes. In a production environment, RLS policies should be implemented to secure user data.

## Implementation Notes

1. The database schema is designed to be extensible, allowing for additional fields to be added in the future.
2. The use of arrays for interests, relationship types, and gender preferences allows for flexible and efficient storage of multiple values.
3. The automatic triggers ensure data consistency and reduce the need for manual database operations.

## Future Enhancements

1. Implement RLS policies for production security
2. Add tables for matches, messages, and other social features
3. Implement full-text search for user profiles
4. Add analytics and reporting capabilities
