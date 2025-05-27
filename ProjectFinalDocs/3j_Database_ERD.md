# Database Entity-Relationship Diagram (ERD)

## Overview
This document provides a detailed Entity-Relationship Diagram for the ConnectSphere database, showing all tables, their relationships, and cardinality notations. The ERD illustrates how different entities in the system relate to each other, which is critical for understanding the database architecture.

## Complete ERD

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
                          ┌─────────────────────────┼─────────────────────────┐
                          │                         │                         │
                          │                         │                         │
                          │                         │                         │
            ┌─────────────▼───────────┐   ┌─────────▼────────────┐   ┌───────▼─────────────────┐
            │     conversations       │   │     connections       │   │     subscriptions       │
            ├─────────────────────────┤   ├───────────────────────┤   ├───────────────────────┤
            │ id (PK): UUID           │   │ id (PK): UUID         │   │ id (PK): UUID         │
            │ created_at: TIMESTAMP   │   │ requester_id (FK): UUID│   │ user_id (FK): UUID    │
            │ updated_at: TIMESTAMP   │   │ recipient_id (FK): UUID│   │ plan_type: VARCHAR    │
            └─────────────┬───────────┘   │ status: VARCHAR       │   │ status: VARCHAR       │
                          │               │ created_at: TIMESTAMP │   │ start_date: TIMESTAMP │
                          │               │ updated_at: TIMESTAMP │   │ end_date: TIMESTAMP   │
                          │               └────┬──────────────┬───┘   │ payment_status: VARCHAR│
                          │                    │              │       └───────────┬───────────┘
                          │                    │              │                   │
                          │                    │              │                   │
            ┌─────────────▼───────────┐        │              │         ┌─────────▼───────────┐
            │       messages          │        │              │         │       payments      │
            ├─────────────────────────┤        │              │         ├───────────────────┤
            │ id (PK): UUID           │        │              │         │ id (PK): UUID     │
            │ conversation_id (FK): UUID        │              │         │ subscription_id: UUID
            │ sender_id (FK): UUID    │◄───────┘              └────────►│ amount: DECIMAL   │
            │ content: TEXT           │                                 │ currency: VARCHAR  │
            │ is_read: BOOLEAN        │                                 │ payment_method: VARCHAR
            │ created_at: TIMESTAMP   │                                 │ status: VARCHAR    │
            └───────────┬─────────────┘                                 │ created_at: TIMESTAMP
                        │                                               └───────────────────┘
                        │
                        │
            ┌───────────▼─────────────┐
            │     voice_messages      │
            ├─────────────────────────┤
            │ id (PK): UUID           │
            │ message_id (FK): UUID   │
            │ audio_url: VARCHAR      │
            │ duration: INTEGER       │
            │ transcription: TEXT     │
            │ created_at: TIMESTAMP   │
            └─────────────────────────┘


            ┌───────────────────────┐                 ┌───────────────────────┐
            │    chat_advisors      │                 │     notifications     │
            ├───────────────────────┤                 ├───────────────────────┤
            │ id (PK): UUID         │                 │ id (PK): UUID         │
            │ user_id (FK): UUID    │◄────────────────┤ user_id (FK): UUID    │
            │ personality: VARCHAR  │                 │ type: VARCHAR         │
            │ created_at: TIMESTAMP │                 │ content: TEXT         │
            │ updated_at: TIMESTAMP │                 │ related_id: UUID      │
            └───────────────────────┘                 │ is_read: BOOLEAN      │
                                                      │ created_at: TIMESTAMP │
                                                      └───────────────────────┘
```

## Cardinality Relationships

1. **auth.users ↔ profiles** (1:1)
   - Each user in auth.users has exactly one profile
   - Each profile belongs to exactly one user

2. **profiles ↔ conversations** (1:N through conversation_participants)
   - Each profile can participate in many conversations
   - Each conversation has multiple participants (profiles)

3. **profiles ↔ connections** (1:N as both requester and recipient)
   - Each profile can initiate many connection requests (requester_id)
   - Each profile can receive many connection requests (recipient_id)
   - Each connection has exactly one requester and one recipient

4. **profiles ↔ subscriptions** (1:N)
   - Each profile can have multiple subscriptions (over time)
   - Each subscription belongs to exactly one profile

5. **conversations ↔ messages** (1:N)
   - Each conversation can have many messages
   - Each message belongs to exactly one conversation

6. **profiles ↔ messages** (1:N)
   - Each profile can send many messages (sender_id)
   - Each message has exactly one sender

7. **messages ↔ voice_messages** (1:1 optional)
   - A message may have one voice message attachment
   - Each voice message belongs to exactly one message

8. **subscriptions ↔ payments** (1:N)
   - Each subscription can have multiple payments
   - Each payment belongs to exactly one subscription

9. **profiles ↔ chat_advisors** (1:1)
   - Each profile can have one chat advisor configuration
   - Each chat advisor belongs to exactly one profile

10. **profiles ↔ notifications** (1:N)
    - Each profile can receive many notifications
    - Each notification belongs to exactly one profile

## Implementation in ConnectSphere

This ERD is implemented in the Supabase database with appropriate tables and relationships. The relationships are enforced through:

1. **Foreign Key Constraints**: Ensuring referential integrity between related tables
2. **Unique Constraints**: Ensuring uniqueness where required (e.g., username in profiles)
3. **Indexes**: Optimizing query performance for frequently accessed fields
4. **Triggers**: Automating certain actions like updating timestamps

## SQL Implementation Highlights

```sql
-- Example of relationships being established

-- 1. Profile linked to auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  -- other fields
);

-- 2. Connections with dual foreign keys to profiles
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  -- other fields
  UNIQUE(requester_id, recipient_id)
);

-- 3. Messages linked to conversations and senders
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES profiles(id),
  -- other fields
);
```

## How This ERD Addresses Database Design Constraints

1. **Data Integrity**: Foreign key relationships ensure referential integrity across the database.

2. **Normalization**: The schema follows normalization principles to minimize redundancy.

3. **Performance**: The structure is optimized for common query patterns in the application.

4. **Flexibility**: The design allows for future extensions, such as adding new message types.

5. **Security**: The structure supports Row Level Security policies for data access control.
