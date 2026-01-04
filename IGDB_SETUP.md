# IGDB API Setup Guide

This guide will help you set up the IGDB API credentials needed for the game cover search feature in the EmulatorJS plugin.

## What is IGDB?

IGDB (Internet Game Database) is a comprehensive video game database with millions of game titles and cover arts. The API allows us to search for games and download their official cover images.

## Step-by-Step Setup

### Step 1: Create or Sign in to Twitch

1. Go to https://www.twitch.tv
2. Create a new account or sign in to your existing account
3. **Important**: Enable Two-Factor Authentication:
   - Click your profile icon in the top right
   - Select "Settings"
   - Go to "Security and Privacy"
   - Enable "Two-Factor Authentication"
   - Save your backup codes in a safe place

### Step 2: Register Your Application

1. Visit https://dev.twitch.tv/console/apps/create
2. Fill in the form:
   - **Application Name**: `HFS EmulatorJS` (or any name you prefer)
   - **OAuth Redirect URL**: `http://localhost` (required but not used)
   - **Application Category**: Select "Application Integration"
   - **Client Type**: Select **Confidential** (important!)

3. Click "Create"

### Step 3: Get Your Credentials

1. Go to https://dev.twitch.tv/console/apps
2. Click "Manage" on your newly created application
3. You'll see:
   - **Client ID**: Copy this
   - **Client Secret**: Click "New Secret" to generate one, then copy it

**⚠️ IMPORTANT**: Keep these credentials secret! Never share them or commit them to public repositories.

### Step 4: Configure in HFS Admin Panel

This is the easiest way to configure the credentials:

1. **Open HFS Admin Panel**
   - Usually at `http://localhost:80/admin` or `http://your-hfs-ip:port/admin`
   - You need admin permissions to access the panel

2. **Go to Plugins Section**
   - Look for "Plugins" in the left menu
   - Find "EmulatorJS" in the plugins list
   - Click on it to open the configuration

3. **Fill in the Credentials**
   - **IGDB Client ID**: Paste your Client ID from Step 3
   - **IGDB Client Secret**: Paste your Client Secret from Step 3
   
   ![Admin Panel Example](https://imgur.com/placeholder.png)

4. **Save Configuration**
   - Click the "Save" button
   - The changes take effect immediately
   - No need to restart HFS!

5. **Verify Setup**
   - Navigate to a folder with ROM files
   - Right-click on a ROM file
   - Select "Set Cover" from the context menu
   - Try searching for a game
   - If it works, you're all set!

### Alternative: Environment Variables (Legacy)

If you prefer to use environment variables instead (not recommended), you can still set them before starting HFS:

**Windows (Command Prompt):**
```batch
set IGDB_CLIENT_ID=your_actual_client_id_here
set IGDB_CLIENT_SECRET=your_actual_client_secret_here
hfs.exe
```

**Windows (PowerShell):**
```powershell
$env:IGDB_CLIENT_ID = "your_actual_client_id_here"
$env:IGDB_CLIENT_SECRET = "your_actual_client_secret_here"
.\hfs.exe
```

**Linux/Mac:**
```bash
export IGDB_CLIENT_ID="your_actual_client_id_here"
export IGDB_CLIENT_SECRET="your_actual_client_secret_here"
./hfs
```

**Note**: Admin panel configuration takes priority over environment variables.

## Troubleshooting

### Error: "IGDB Client ID and Secret are not configured"

**Solution**: Make sure you've filled in both fields in the HFS Admin Panel:
1. Go to Admin → Plugins → EmulatorJS
2. Fill in the IGDB Client ID field
3. Fill in the IGDB Client Secret field
4. Click "Save"
5. Try again

### Error: "Failed to parse IGDB token response"

This usually means:
- Your Client Secret is incorrect
- Your credentials are invalid or expired

**Solution**:
1. Go to https://dev.twitch.tv/console/apps
2. Click "Manage" on your application
3. Generate a new Client Secret
4. Update your environment variables with the new credentials
5. Restart HFS

### No search results found

**Possible causes**:
- The game name doesn't exist in IGDB database
- The search term is too vague
- IGDB is temporarily unavailable

**Solution**:
1. Try searching for a different game
2. Use the exact game title (e.g., "The Legend of Zelda" instead of just "Zelda")
3. Check IGDB.com directly to see if the game exists: https://www.igdb.com/games

### "CORS error" or "network error"

**Cause**: IGDB API might be blocking requests

**Solution**:
1. Check your internet connection
2. Try a different game search
3. Wait a few minutes and try again (IGDB has rate limits: 4 requests per second)

### Downloaded covers are not showing

**Possible causes**:
- The file didn't download correctly
- The covers folder has permission issues

**Solution**:
1. Check if the covers are saved: Navigate to `plugin/covers/` in your HFS plugin folder
2. Make sure HFS has write permissions to the plugin folder
3. Try downloading again
4. Check the HFS server logs for detailed error messages

## Additional Information

### API Rate Limits

IGDB allows:
- **4 requests per second** per IP address
- **8 concurrent requests** maximum

The plugin respects these limits automatically.

### Privacy & Data Usage

When using the IGDB API:
- Your game search queries are sent to IGDB servers
- IGDB may log your queries for analytics
- No personal information is required
- IGDB is free to use (even for commercial projects)

See: https://www.igdb.com/api

### Alternative: Manual Cover Setup

If you don't want to set up IGDB API, you can manually place cover images:

1. Create a `.jpg` or `.png` file with the same name as your ROM
   - Example: `Super Mario.nes` → `Super Mario.jpg`
2. Place it in the same folder as the ROM
3. The plugin will automatically use it as the cover

## Need Help?

- IGDB Documentation: https://api-docs.igdb.com/
- Twitch Developer Documentation: https://dev.twitch.tv/docs/
- HFS Documentation: https://github.com/rejetto/hfs
