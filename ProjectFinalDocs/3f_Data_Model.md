# Data Model

## Overview
The Data Model for ConnectSphere represents the database schema and the relationships between different entities in the system. ConnectSphere uses Supabase's PostgreSQL database for data storage, providing a robust foundation for the application's data needs. The model has been updated to include the real-time messaging system, Google OAuth authentication, and other recent implementations.

## Entity-Relationship Diagram

```
┌───────────────────────┐                 ┌─────────────────────────┐
│       auth.users      │                 │         profiles        │
├───────────────────────┤                 ├─────────────────────────┤
│ id (PK): UUID         │◄───────1:1──────┤ id (PK, FK): UUID       │
│ email: VARCHAR        │                 │ first_name: VARCHAR     │
│ encrypted_password: VARCHAR             │ last_name: VARCHAR      │
│ created_at: TIMESTAMP │                 │ username: VARCHAR       │
│ updated_at: TIMESTAMP │                 │ birthdate: DATE         │
└───────────────────────┘                 │ gender: VARCHAR         │
                                          │ city: VARCHAR           │
                                          │ bio: TEXT               │
                                          │ interests: VARCHAR[]    │
                                          │ relationship_types: VARCHAR[]
                                          │ gender_preferences: VARCHAR[]
                                          │ created_at: TIMESTAMP   │
                                          │ updated_at: TIMESTAMP   │
                                          └──────────┬──────────────┘
                                                     │
                                                     │
                                          ┌──────────┴──────────────┐
                                          │                         │
                          ┌───────────────▼─────┐         ┌─────────▼─────────────┐
                          │  conversations       │         │     connections       │
                          ├─────────────────────┤         ├───────────────────────┤
                          │ id (PK): UUID       │         │ id (PK): UUID         │
                          │ created_at: TIMESTAMP         │ requester_id (FK): UUID│
                          │ updated_at: TIMESTAMP         │ recipient_id (FK): UUID│
                          └──────────┬──────────┘         │ status: VARCHAR       │
                                     │                    │ created_at: TIMESTAMP │
                                     │                    │ updated_at: TIMESTAMP │
                          ┌──────────▼──────────┐         └───────────────────────┘
                          │       messages       │
                          ├─────────────────────┤
                          │ id (PK): UUID       │
                          │ conversation_id (FK): UUID
                          │ sender_id (FK): UUID│
                          │ content: TEXT       │
                          │ is_read: BOOLEAN    │
                          │ created_at: TIMESTAMP
                          └─────────────────────┘

┌───────────────────────┐                 ┌─────────────────────────┐
│    subscriptions      │                 │        payments         │
├───────────────────────┤                 ├─────────────────────────┤
│ id (PK): UUID         │◄───────1:N──────┤ id (PK): UUID           │
│ user_id (FK): UUID    │                 │ subscription_id (FK): UUID
│ plan_type: VARCHAR    │                 │ amount: DECIMAL         │
│ status: VARCHAR       │                 │ currency: VARCHAR       │
│ start_date: TIMESTAMP │                 │ payment_method: VARCHAR │
│ end_date: TIMESTAMP   │                 │ status: VARCHAR         │
│ payment_status: VARCHAR                 │ created_at: TIMESTAMP   │
└───────────────────────┘                 └─────────────────────────┘

┌───────────────────────┐
│     notifications     │
├───────────────────────┤
│ id (PK): UUID         │
│ user_id (FK): UUID    │
│ type: VARCHAR         │
│ content: TEXT         │
│ related_id: UUID      │
│ is_read: BOOLEAN      │
│ created_at: TIMESTAMP │
└───────────────────────┘
```

## Table Definitions

### 1. auth.users (Supabase Auth Table)
- **Description**: Stores authentication information for users
- **Columns**:
  - `id` (PK): UUID - Unique identifier for the user
  - `email`: VARCHAR - User's email address
  - `encrypted_password`: VARCHAR - Hashed password
  - `created_at`: TIMESTAMP - When the user account was created
  - `updated_at`: TIMESTAMP - When the user account was last updated
  - (Additional auth-related fields managed by Supabase)
- **Constraints**:
  - Primary Key on `id`
  - Unique constraint on `email`
- **Notes**: This table is managed by Supabase Auth and is not directly modified by the application

### 2. profiles
- **Description**: Stores user profile information
- **Columns**:
  - `id` (PK, FK): UUID - Unique identifier (references auth.users.id)
  - `first_name`: VARCHAR - User's first name
  - `last_name`: VARCHAR - User's last name
  - `username`: VARCHAR - Unique username
  - `birthdate`: DATE - User's date of birth
  - `gender`: VARCHAR - User's gender
  - `city`: VARCHAR - User's location
  - `bio`: TEXT - User's self-description
  - `interests`: VARCHAR[] - Array of user interests
  - `relationship_types`: VARCHAR[] - Desired relationship types
  - `gender_preferences`: VARCHAR[] - Gender preferences for matching
  - `created_at`: TIMESTAMP - When the profile was created
  - `updated_at`: TIMESTAMP - When the profile was last updated
- **Constraints**:
  - Primary Key on `id`
  - Foreign Key on `id` references auth.users.id
  - Unique constraint on `username`
- **SQL Implementation**:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  birthdate DATE,
  gender TEXT,
  city TEXT,
  bio TEXT,
  interests TEXT[],
  relationship_types TEXT[],
  gender_preferences TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. conversations
- **Description**: Represents real-time chat conversations between two users
- **Columns**:
  - `id` (PK): UUID - Unique identifier
  - `user1_id` (FK): UUID - First participant (references profiles.id)
  - `user2_id` (FK): UUID - Second participant (references profiles.id)
  - `created_at`: TIMESTAMP - When the conversation was created
  - `updated_at`: TIMESTAMP - When the conversation was last updated
  - `last_message_at`: TIMESTAMP - When the last message was sent
- **Constraints**:
  - Primary Key on `id`
  - Foreign Keys on `user1_id` and `user2_id` reference profiles.id
  - Unique constraint on (`user1_id`, `user2_id`) to prevent duplicate conversations
- **SQL Implementation**:
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES profiles(id),
  user2_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);
```

### 4. conversation_participants (Join Table, not shown in diagram)
- **Description**: Maps users to conversations they participate in
- **Columns**:
  - `conversation_id` (PK, FK): UUID - References conversations.id
  - `profile_id` (PK, FK): UUID - References profiles.id
  - `created_at`: TIMESTAMP - When the participant was added
- **Constraints**:
  - Composite Primary Key on (`conversation_id`, `profile_id`)
  - Foreign Key on `conversation_id` references conversations.id
  - Foreign Key on `profile_id` references profiles.id
- **SQL Implementation**:
```sql
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id),
  profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, profile_id)
);
```

### 5. messages
- **Description**: Stores messages within real-time conversations with WebSocket delivery
- **Columns**:
  - `id` (PK): UUID - Unique identifier
  - `conversation_id` (FK): UUID - References conversations.id
  - `sender_id` (FK): UUID - References profiles.id
  - `content`: TEXT - Message content
  - `is_read`: BOOLEAN - Whether the message has been read
  - `created_at`: TIMESTAMP - When the message was sent
- **Constraints**:
  - Primary Key on `id`
  - Foreign Key on `conversation_id` references conversations.id
  - Foreign Key on `sender_id` references profiles.id
- **Real-time Functionality**:
  - Messages trigger WebSocket events when inserted
  - Clients subscribe to these events for instant updates
  - Changes to the `is_read` status trigger update events
- **SQL Implementation**:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable real-time subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### 6. connections
- **Description**: Represents connections between users
- **Columns**:
  - `id` (PK): UUID - Unique identifier
  - `requester_id` (FK): UUID - References profiles.id
  - `recipient_id` (FK): UUID - References profiles.id
  - `status`: VARCHAR - Connection status (pending, accepted, declined)
  - `created_at`: TIMESTAMP - When the connection was requested
  - `updated_at`: TIMESTAMP - When the connection status was updated
- **Constraints**:
  - Primary Key on `id`
  - Foreign Key on `requester_id` references profiles.id
  - Foreign Key on `recipient_id` references profiles.id
  - Unique constraint on (`requester_id`, `recipient_id`)
- **SQL Implementation**:
```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, recipient_id)
);
```

### 7. subscriptions
- **Description**: Stores user subscription information
- **Columns**:
  - `id` (PK): UUID - Unique identifier
  - `user_id` (FK): UUID - References auth.users.id
  - `plan_type`: VARCHAR - Type of subscription plan
  - `status`: VARCHAR - Current status of subscription
  - `start_date`: TIMESTAMP - When subscription starts
  - `end_date`: TIMESTAMP - When subscription expires
  - `payment_status`: VARCHAR - Status of payment
- **Constraints**:
  - Primary Key on `id`
  - Foreign Key on `user_id` references auth.users.id
- **SQL Implementation**:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 8. payments
- **Description**: Records payments for subscriptions
- **Columns**:
  - `id` (PK): UUID - Unique identifier
  - `subscription_id` (FK): UUID - References subscriptions.id
  - `amount`: DECIMAL - Payment amount
  - `currency`: VARCHAR - Currency code
  - `payment_method`: VARCHAR - Method of payment
  - `status`: VARCHAR - Payment status
  - `created_at`: TIMESTAMP - When payment was processed
- **Constraints**:
  - Primary Key on `id`
  - Foreign Key on `subscription_id` references subscriptions.id
- **SQL Implementation**:
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9. notifications
- **Description**: Stores notifications for users
- **Columns**:
  - `id` (PK): UUID - Unique identifier
  - `user_id` (FK): UUID - References auth.users.id
  - `type`: VARCHAR - Notification type
  - `content`: TEXT - Notification content
  - `related_id`: UUID - ID of related entity
  - `is_read`: BOOLEAN - Whether notification has been read
  - `created_at`: TIMESTAMP - When notification was created
- **Constraints**:
  - Primary Key on `id`
  - Foreign Key on `user_id` references auth.users.id
- **SQL Implementation**:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Database Indices

To optimize query performance, the following indices are recommended:

1. **profiles**:
   - Index on `username` for quick username lookups
   - Index on `city` for location-based searches
   - Indices on `interests`, `relationship_types`, and `gender_preferences` for match filtering

2. **messages**:
   - Index on `conversation_id` for retrieving conversation messages
   - Index on `sender_id` for filtering messages by sender
   - Index on `created_at` for chronological sorting

3. **connections**:
   - Indices on `requester_id` and `recipient_id` for finding user connections
   - Index on `status` for filtering connection requests

4. **subscriptions**:
   - Index on `user_id` for retrieving user subscriptions
   - Index on `status` for filtering active subscriptions
   - Index on `end_date` for finding expiring subscriptions

5. **notifications**:
   - Index on `user_id` for retrieving user notifications
   - Index on `is_read` for filtering unread notifications
   - Index on `created_at` for chronological sorting

## Data Access and Security

### Row Level Security (RLS)

Supabase supports Row Level Security (RLS) policies to control access to data. The following policies would be implemented:

1. **profiles**:
   - Users can read their own profile
   - Users can read other profiles for matching purposes
   - Users can only update their own profile

2. **conversations**:
   - Users can only access conversations they participate in
   - Users can only create conversations with other users

3. **messages**:
   - Users can only read messages in conversations they participate in
   - Users can only send messages to conversations they participate in

4. **connections**:
   - Users can see connections where they are the requester or recipient
   - Users can only update connections they are involved with

5. **subscriptions**:
   - Users can only see their own subscriptions
   - Users can only update their own subscriptions

6. **notifications**:
   - Users can only see their own notifications
   - Users can only mark their own notifications as read

### Example RLS Policy

```sql
-- Example RLS policy for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for selecting profiles
CREATE POLICY select_own_profile ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy for updating profiles
CREATE POLICY update_own_profile ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy for inserting profiles
CREATE POLICY insert_own_profile ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Implementation in ConnectSphere

The data model is implemented in ConnectSphere through:

1. **Supabase Setup**:
   - Database tables created with proper schemas
   - Foreign key relationships enforced
   - RLS policies configured for security

2. **JavaScript Integration**:
   - The Supabase client connects to the database
   - CRUD operations are performed through the client API
   - Data is transformed between database format and application models

3. **Table Creation Scripts**:
   - SQL scripts for creating and modifying tables
   - Example: `create_subscription_tables.sql` and `supabase_subscription_setup.sql`

## How Data Model Addresses Design Constraints

1. **Authentication Constraint**: The model uses Supabase's auth.users table and RLS policies to ensure only authenticated users can access data.

2. **Authorization Constraint**: RLS policies restrict operations based on user identity, ensuring users can only perform authorized operations.

3. **UI Modification Constraint**: The data model is separate from the UI, allowing independent modification of either component.

4. **Centralized Data Constraint**: All application data is stored in the Supabase PostgreSQL database, providing a central repository.

5. **Modifiability Constraint**: The relational model with clear entity relationships supports easy modifications to the data structure.
