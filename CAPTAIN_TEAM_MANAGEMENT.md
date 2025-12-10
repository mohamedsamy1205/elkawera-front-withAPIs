# Captain Team Management & Match System - Implementation Summary

## ✅ **Changes Made (Updated)**

### 1. **Teams Page (Sectioned View for Captains)**
**File**: `pages/Teams.tsx`

**Changes**:
- **Captains** now see two distinct sections:
  1. **"Your Teams"**: Teams where they are the captain.
  2. **"Other Teams"**: All other teams in the league.
- **Admins** see a unified grid of all teams.
- **Empty States**: Custom empty states for "Your Teams" (prompting to create one) and "Other Teams".
- **Visuals**: "Your Team" badge added to captain's own teams.

### 2. **Captain Dashboard (Enhanced)**
**File**: `pages/CaptainDashboard.tsx`

**New Features**:
- **Team Size Validation**:
  - **Schedule Match**: Captains **cannot** schedule a match if their team has **< 3 players** or **> 7 players**.
  - **Invite Players**: Captains **cannot** invite more players if their team has reached the **maximum of 7 players**.
- **Enhanced Invitation Modal**:
  - **All Users**: Now lists **all users** registered on the platform, not just those with player cards.
  - **Status Display**: Shows user status next to their name:
    - **(Admin)**: If user is an admin.
    - **(Team Name)**: If user is already a captain or player of another team.
    - **(Free Agent)**: If user is unattached.
  - **Filtering**: Automatically filters out the captain themselves and users already in the team.
  - **Direct User Invite**: Invitations are sent to the **User ID**, ensuring they receive notifications.

### 3. **Match Approval Workflow**
**Files**: `pages/ExternalMatchScheduler.tsx`, `pages/AdminMatches.tsx`, `utils/db.ts`

**Changes**:
- **Match Requests**: Captains now create a **Match Request** instead of immediately starting a match.
- **Admin Approval**:
  - Admins see a **"Pending Requests"** section in the Match Management page (`/admin/matches`).
  - Admins can **Approve** (starts the match immediately) or **Reject** (with a reason) requests.
- **Notifications**:
  - **Admins** are notified when a new match request is submitted.
  - **Captains** are notified when their request is **Approved** or **Rejected**.

### 4. **Database Updates**
**File**: `utils/db.ts`

**New Store**: `match_requests` (v9)
- Stores pending match requests.
- Indexed by `requestedBy` and `status`.

**New Functions**:
- `saveMatchRequest(request)`: Saves a new request and notifies admins.
- `getAllMatchRequests()`: Fetches all requests.
- `updateMatchRequestStatus(id, status, reason)`: Updates status, creates match if approved, and notifies captain.

## 📋 **How It Works**

### **Scheduling a Match (Captain)**
1. Go to **Captain Dashboard**.
2. Click **"Schedule External Match"**.
3. **Validation Check**:
   - If team < 3 players: Alert "Must have at least 3 players".
   - If team > 7 players: Alert "Cannot have more than 7 players".
4. Select Opponent Team.
5. Click **"Schedule Match"**.
6. **Result**: A **Match Request** is sent to admins. Status is "Pending".

### **Approving a Match (Admin)**
1. Go to **Match Management** (`/admin/matches`).
2. See **"Pending Requests"** section at the top.
3. Review request (Home vs Away).
4. **Approve**:
   - Match is created with status "Running".
   - Captain receives "Match Approved" notification.
5. **Reject**:
   - Enter rejection reason.
   - Captain receives "Match Rejected" notification with reason.

### **Inviting Players (Captain)**
1. Click **"Invite Players"**.
2. **Validation Check**: If team >= 7 players, alert "Team Full".
3. See list of all users.
4. Users in other teams show their team name (e.g., "Thunder FC").
5. Select users and click **"Send Invitations"**.
6. Users receive notifications.

## 🔐 **Permission Matrix (Updated)**

| Action | Admin | Captain (Own Team) | Captain (Other Team) | Player |
|--------|-------|-------------------|---------------------|--------|
| View "Your Teams" Section | N/A | ✅ | N/A | N/A |
| Schedule Match (Direct) | ✅ | ❌ (Request only) | ❌ | ❌ |
| Request Match | ❌ | ✅ (if 3-7 players) | ❌ | ❌ |
| Approve/Reject Match | ✅ | ❌ | ❌ | ❌ |
| Invite Players | ✅ | ✅ (max 7) | ❌ | ❌ |

## 🐛 **Testing Checklist**

### **As Captain**:
- [ ] **Teams Page**: Verify "Your Teams" and "Other Teams" sections appear.
- [ ] **Invite Modal**: Verify you see all users with status (Admin/Team Name).
- [ ] **Invite Modal**: Verify you cannot invite if team has 7 players.
- [ ] **Schedule Match**: Verify blocked if team < 3 players.
- [ ] **Schedule Match**: Verify blocked if team > 7 players.
- [ ] **Schedule Match**: Verify successful request sends alert "Request sent to admins".
- [ ] **Notifications**: Verify receiving "Match Approved" or "Match Rejected" notifications.

### **As Admin**:
- [ ] **Match Management**: Verify "Pending Requests" section appears.
- [ ] **Match Management**: Verify you can Approve a request (match starts).
- [ ] **Match Management**: Verify you can Reject a request (reason prompt).

---

**Status**: ✅ **COMPLETE**
All requested enhancements for Captain Team Management and Match System are implemented.
