
# 🧪 ElKawera Full Feature Testing Guide

This guide covers the end-to-end testing flowchart to verify all features including the new Match Reporter, Stats Logic, and Fair Team Generator.

## 🛠️ Prerequisites
- Use **Google Chrome** (recommended) or any modern browser.
- Have the `dev` server running (`npm run dev`).
- Be prepared to use **Incognito Mode** to simulate multiple users (Admin vs Player vs Captain).

---

##  PHASE 1: The Administrator Setup (The Boss)
*Goal: Create an Admin account and populate the initial database.*

1. **Clean Slate** (Optional but recommended):
   - Open Developer Tools (`F12`).
   - Go to **Application** tab -> **IndexedDB** -> **ElkaweraDB**.
   - Right-click and **Delete database**.
   - Refresh the page to initialize a clean DB.

2. **Create the Admin Account**:
   - Go to `/signup`.
   - Sign up with Name: `Admin Boss`, Email: `admin@test.com`, Role: `Captain` (or Player).
   - *Hack to become Admin*:
     - Open Developer Tools (`F12`) -> **Application** -> **IndexedDB** -> **ElkaweraDB** -> **users**.
     - Find your user entry.
     - Edit the `role` value from `"captain"` to `"admin"`.
     - Refresh the page.
     - You should now see **Admin Dashboard** features (Admin Team Cards, Match Reporter button).

3. **Create Seed Players (Legacy Method)**:
   - On Dashboard, click **Add New Card**.
   - Create a few players manually (e.g., "Star Striker", "Solid Defender", "Wall GK").
   - Assign standardized positions: **CF**, **CB**, **GK**.
   - *Verify*: They appear on the Dashboard.

---

## PHASE 2: The Player Journey (New User)
*Goal: Verify the "Request Card" flow.*

1. **User Sign Up**:
   - Open an **Incognito Window**.
   - Go to `/signup`.
   - Sign up as **Player**: Name: `New Rookie`, Email: `rookie@test.com`.
   - On the immediate "Request Card" screen, fill in details (Pos: **CF**).
   - Submit.
   - *State*: You should see "Pending Approval".

2. **Admin Approval**:
   - Switch back to **Admin Window**.
   - Go to **Dashboard**. Check "Registration Requests" section (or Notification bell).
   - Click **Approve**.
   - You might be taken to **Create Player** screen to finalize stats.
   - Click **Save/Confirm**.

3. **User Verification**:
   - Switch back to **Incognito (Player) Window**.
   - Refresh.
   - Go to **Profile**. You should see your official Player Card.

---

## PHASE 3: The Captain & Team Management
*Goal: Verify Team Creation and Match Scheduling.*

1. **Captain Sign Up**:
   - Sign up as a new user (Role: **Captain**) or use the Admin account if you skipped Phase 2.
   - Go to `Teams` page.

2. **Create Team**:
   - Click **Create Team**.
   - Name: `Red Dragons`.
   - Invite the Player from Phase 2 (`rookie@test.com`) and maybe search for "Star Striker" (Admin created).
   - *Verify*: Team appears in list.

3. **Schedule Match**:
   - Go to **Matches** (or External Match Scheduler).
   - Schedule a match against another team (Create a second team "Blue Sharks" first if needed).
   - Note: If using **External Match Scheduler**, just ensure the request is sent.

---

## PHASE 4: The Match Day (Testing New Features!) 🏆
*Goal: Verify Match Reporter, Stats Calculation, and OVR updates.*

1. **Set the Stage**:
   - Ensure you have 2 Teams with players in them.

2. **Reporting the Match (Admin Only)**:
   - On Dashboard, click **Match Results** (The Trophy Icon).
   - Select **Home Team** (`Red Dragons`) and **Away Team** (`Blue Sharks`).
   - Enter Score: `Red Dragons 3 - 0 Blue Sharks`.

3. **Input Stats (Crucial Step)**:
   - **Home Team (Winners)**:
     - Providing high stats for testing bonuses.
     - `Star Striker`: 3 Goals, 1 Assist. (Should get huge OVR boost).
     - `Wall GK`: Clean Sheet (Auto-checked?), 5 Saves.
   - **Away Team (Losers)**:
     - `Rookie`: 0 Goals, 0 Assists. 
     - *Check*: GK should have "Goals Conceded" = 3 auto-filled.

4. **Submit Report**:
   - Click **Submit Match Result**.
   - verify redirection to Dashboard.

5. **Verify Calculations**:
   - Go to **Leaderboard**.
   - Check if `Star Striker` is top scorer.
   - Check **Compare** page: Compare `Star Striker` vs `Rookie`.
   - Compare Stats: verify `Clean Sheets` and `Goals` updated.
   - **OVR Verification**:
     - `Star Striker` should have increased OVR (e.g. +2 due to 3 goals).
     - `Blue Sharks GK` might have dropped OVR due to 3 conceded goals.
   - This confirms the complex `calculation.ts` logic is working!

---

## PHASE 5: Extras
1. **Team Deletion**: Admin goes to Teams page, deletes a test team. Verify it's gone.
2. **Leaderboard Filtering**: Test the new `CF`, `CB`, `GK` filters.

Good luck testing! 🚀
