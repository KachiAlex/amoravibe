# Database Schema Migration Required

This document outlines the database schema changes needed to fully support the frontend optimizations implemented across the Matches, Messages, Discover, and Spaces tabs.

## Current Status

The current `schema.prisma` has a minimal schema. Many frontend features are working with **mock data** or **client-side only** persistence until these schema changes are applied.

---

## Required Schema Changes

### 1. User Model Updates

Add the following fields to the existing `User` model:

```prisma
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  hashedPassword String?
  displayName    String?
  name           String?
  age            Int?
  location       String?
  job            String?
  avatar         String?
  about          String?
  interests      String[]
  role           String   @default("user")
  isVerified     Boolean  @default(false)
  banned         Boolean  @default(false)
  createdAt      DateTime @default(now())
  
  // NEW FIELDS
  bio            String?      // For member profiles
  lastActive     DateTime?    // For online presence tracking
  
  // Relations
  matches        Match[]      @relation("UserMatches")
  messagesSent   Message[]    @relation("MessagesFrom")
  messagesReceived Message[]  @relation("MessagesTo")
  likes          Like[]       @relation("UserLikes")
  likedBy        Like[]       @relation("LikedBy")
  passes         Pass[]       @relation("UserPasses")
  passedBy       Pass[]       @relation("PassedBy")
  bookmarks      Bookmark[]   @relation("UserBookmarks")
  bookmarkedBy   Bookmark[]   @relation("BookmarkedBy")
  spaceMembers   SpaceMember[]
}
```

### 2. Space Model Updates

Update the `Space` model:

```prisma
model Space {
  id                 String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name               String        @unique
  description        String?
  icon               String?       // NEW: Emoji or icon identifier
  orientation        String        // NEW: Space orientation (e.g., "straight", "gay", "lesbian", "bi", "general")
  roomCreationLimit  Int           @default(10) // NEW: Max rooms per space
  createdAt          DateTime      @default(now())
  
  // Relations
  rooms              Room[]
  members            SpaceMember[]
}
```

### 3. New Models

#### Room Model
```prisma
model Room {
  id          String   @id @default(uuid())
  name        String
  description String?
  spaceId     String   @db.Uuid
  creatorId   String
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  space       Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  creator     User     @relation("CreatedRooms", fields: [creatorId], references: [id])
  members     RoomMember[]
  messages    RoomMessage[]
  
  @@index([spaceId])
  @@index([creatorId])
}
```

#### SpaceMember Model
```prisma
model SpaceMember {
  id        String   @id @default(uuid())
  userId    String
  spaceId   String   @db.Uuid
  joinedAt  DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  space     Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  
  @@unique([userId, spaceId])
  @@index([spaceId])
  @@index([userId])
}
```

#### RoomMember Model
```prisma
model RoomMember {
  id        String   @id @default(uuid())
  userId    String
  roomId    String
  joinedAt  DateTime @default(now())
  
  user      User     @relation("RoomMemberships", fields: [userId], references: [id], onDelete: Cascade)
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roomId])
  @@index([roomId])
  @@index([userId])
}
```

#### RoomMessage Model
```prisma
model RoomMessage {
  id        String   @id @default(uuid())
  roomId    String
  userId    String
  text      String
  createdAt DateTime @default(now())
  
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user      User     @relation("RoomMessages", fields: [userId], references: [id])
  
  @@index([roomId])
  @@index([userId])
}
```

#### Like Model
```prisma
model Like {
  id           String   @id @default(uuid())
  userId       String
  likedUserId  String
  createdAt    DateTime @default(now())
  
  user         User     @relation("UserLikes", fields: [userId], references: [id], onDelete: Cascade)
  likedUser    User     @relation("LikedBy", fields: [likedUserId], references: [id], onDelete: Cascade)
  
  @@unique([userId, likedUserId])
  @@index([userId])
  @@index([likedUserId])
}
```

#### Pass Model
```prisma
model Pass {
  id            String   @id @default(uuid())
  userId        String
  passedUserId  String
  createdAt     DateTime @default(now())
  
  user          User     @relation("UserPasses", fields: [userId], references: [id], onDelete: Cascade)
  passedUser    User     @relation("PassedBy", fields: [passedUserId], references: [id], onDelete: Cascade)
  
  @@unique([userId, passedUserId])
  @@index([userId])
  @@index([passedUserId])
}
```

#### Bookmark Model
```prisma
model Bookmark {
  id               String   @id @default(uuid())
  userId           String
  bookmarkedUserId String
  createdAt        DateTime @default(now())
  
  user             User     @relation("UserBookmarks", fields: [userId], references: [id], onDelete: Cascade)
  bookmarkedUser   User     @relation("BookmarkedBy", fields: [bookmarkedUserId], references: [id], onDelete: Cascade)
  
  @@unique([userId, bookmarkedUserId])
  @@index([userId])
  @@index([bookmarkedUserId])
}
```

### 4. Message Model Updates

Update the existing `Message` model:

```prisma
model Message {
  id        String   @id @default(uuid())
  fromId    String
  toId      String
  text      String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  // NEW FIELDS
  pinned    Boolean  @default(false)  // For pinned messages
  archived  Boolean  @default(false)  // For archived messages
  
  from      User     @relation("MessagesFrom", fields: [fromId], references: [id])
  to        User     @relation("MessagesTo", fields: [toId], references: [id])
  
  @@index([fromId])
  @@index([toId])
  @@index([pinned])
  @@index([archived])
}
```

---

## Migration Steps

1. **Backup your database** before running any migrations
2. Update `apps/web/prisma/schema.prisma` with the changes above
3. Run `npx prisma migrate dev --name add_spaces_and_interactions` to create migration
4. Run `npx prisma generate` to update the Prisma Client
5. Restart your development server

---

## API Endpoints Affected

Once the schema is updated, the following endpoints will work with **real data** instead of mock data:

### Spaces
- ✅ `GET /api/spaces` - Will show real member counts and online counts
- ✅ `GET /api/spaces/[id]/members` - Will show actual space members
- ✅ `GET /api/spaces/[id]/rooms` - Already working

### Discover
- ✅ `POST /api/matches/like` - Will persist likes and detect mutual matches
- ✅ `POST /api/matches/pass` - Will persist passes
- ✅ `POST /api/matches/bookmark` - Will persist bookmarks
- ✅ `DELETE /api/matches/bookmark` - Will remove bookmarks

### Messages
- ✅ `POST /api/messages/quick-reply` - Already working
- ✅ `PATCH /api/messages/[id]/pin` - Will persist pin status
- ✅ `PATCH /api/messages/[id]/archive` - Will persist archive status

---

## Testing After Migration

After applying the schema changes, test the following:

1. **Spaces Tab**
   - Join/leave spaces
   - View member directory with real users
   - See accurate online counts
   - Create rooms within spaces

2. **Discover Tab**
   - Like profiles and check for mutual matches
   - Pass on profiles
   - Bookmark profiles for later
   - Filter by age range (already working)

3. **Messages Tab**
   - Pin important conversations
   - Archive old messages
   - Send quick replies
   - Filter by pinned/archived status

4. **Matches Tab**
   - View mutual matches
   - See compatibility scores
   - Quick actions (message, view profile)

---

## Notes

- All TODO comments in the API endpoints reference this migration
- Frontend code is already built to handle the data structure
- Mock data is currently being used to demonstrate UI/UX
- Once migration is complete, remove mock data logic from API endpoints
