# Database Reset Instructions

## The Problem
The error "Database connection failed: Unknown error" typically occurs when:
1. The database schema is corrupted
2. There's a version mismatch
3. The database is in an inconsistent state

## Solution: Reset the Database

### Option 1: Using Browser DevTools (Recommended)

1. **Open the application** in your browser
2. **Press F12** to open Developer Tools
3. **Go to the "Application" tab** (Chrome/Edge) or "Storage" tab (Firefox)
4. **Find "IndexedDB"** in the left sidebar
5. **Right-click on "ElkaweraDB"**
6. **Select "Delete database"**
7. **Refresh the page** (F5 or Ctrl+R)
8. The database will be recreated automatically with proper error handling

### Option 2: Using Console Command

1. **Open the browser console** (F12 → Console tab)
2. **Run this command**:
   ```javascript
   indexedDB.deleteDatabase('ElkaweraDB');
   ```
3. **Wait for the message**: "Database ElkaweraDB deleted successfully"
4. **Refresh the page**

### Option 3: Clear All Browser Data

1. **Press Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
2. **Select "Cookies and other site data"** and **"Cached images and files"**
3. **Choose time range**: "All time"
4. **Click "Clear data"**
5. **Refresh the application**

## After Resetting

Once you've reset the database:

1. **Refresh the page** - you'll see new console messages:
   ```
   Database upgrade needed, current version: 0 -> new version: 8
   Creating players store...
   Creating teams store...
   Creating users store...
   ...
   Database upgrade completed successfully
   Database opened successfully
   ```

2. **Try creating a player card again**

3. **Check the console** - you should now see detailed error messages if anything goes wrong:
   - "Attempting to save player: {player data}"
   - "Player saved successfully!"

## What Changed

The new error handling will now show:
- ✅ **Specific error messages** instead of "Unknown error"
- ✅ **Database upgrade progress** in the console
- ✅ **Detailed validation errors** for missing fields
- ✅ **Storage quota warnings** if running out of space
- ✅ **Blocked database warnings** if other tabs are open

## Still Having Issues?

If the problem persists after resetting:

1. **Check the console** for the new detailed error messages
2. **Copy the full error** (right-click → Copy)
3. **Check if you're in private/incognito mode** (IndexedDB may be disabled)
4. **Try a different browser** (Chrome, Firefox, Edge)
5. **Check browser storage settings** - ensure IndexedDB is not blocked

## Testing the Database

After resetting, you can test if the database is working:

1. Open the console
2. Run: `runAllTests()` (if the test utility is loaded)
3. Or manually check:
   ```javascript
   indexedDB.open('ElkaweraDB', 8).onsuccess = (e) => {
     console.log('Database opened!', e.target.result);
   };
   ```

## Expected Console Output (Success)

When everything works correctly, you should see:
```
Database upgrade needed, current version: 0 -> new version: 8
Creating players store...
Creating teams store...
Creating users store...
Creating registration requests store...
Creating matches store...
Creating match verifications store...
Creating team invitations store...
Creating match disputes store...
Creating notifications store...
Creating captain stats store...
Creating match requests store...
Database upgrade completed successfully
Database opened successfully
```

Then when creating a player:
```
Attempting to save player: {id: "abc123", name: "John Doe", ...}
Player saved successfully!
```
