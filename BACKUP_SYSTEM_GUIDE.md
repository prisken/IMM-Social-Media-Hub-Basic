# IMM Marketing Hub - Backup System Guide

## 📋 Overview

The IMM Marketing Hub includes a comprehensive backup system that automatically protects your data, code, and configuration. This system provides both manual and automated backup capabilities with easy restoration options.

## 🚀 Quick Start

### 1. Manual Backup
```bash
# Create a backup immediately
./backup.sh

# Or explicitly
./backup.sh backup
```

### 2. Automated Backups
```bash
# Set up daily backups at 2 AM
./setup-backup-cron.sh daily

# Set up weekly backups on Sunday at 3 AM
./setup-backup-cron.sh weekly

# Set up custom schedule (4 AM daily)
./setup-backup-cron.sh custom '0 4 * * *'
```

### 3. List Available Backups
```bash
./backup.sh list
```

### 4. Restore from Backup
```bash
./backup.sh restore IMM-Marketing-Hub_backup_20241201_143022
```

## 📁 Backup Contents

### What Gets Backed Up

1. **Database Backup**
   - SQLite database file (`user_data/imm_marketing_hub.db`)
   - Contains all posts, accounts, analytics, and settings

2. **Code Backup**
   - All source code and configuration files
   - Excludes: `node_modules`, `dist`, `.git`, media files
   - Includes: TypeScript, React components, build configs

3. **Media Backup**
   - All uploaded media files
   - Generated variants and thumbnails
   - Product images and templates

4. **Git Backup**
   - Complete git repository bundle
   - All commits, branches, and history

5. **Configuration Backup**
   - `package.json`, `package-lock.json`
   - TypeScript configs (`tsconfig.json`)
   - Build configs (`vite.config.ts`, `electron-builder.json`)

6. **System Information**
   - Node.js, npm, git versions
   - Ollama models and versions
   - FFmpeg version
   - Project dependencies

### What's Excluded

- `node_modules/` (can be reinstalled)
- `dist/` and `dist-electron/` (build artifacts)
- `.git/` (handled separately)
- Log files (`*.log`)
- Temporary files (`.DS_Store`, etc.)
- Large media files (included in separate media backup)

## 🔧 Backup Script Commands

### Main Commands

```bash
./backup.sh [COMMAND]
```

| Command | Description |
|---------|-------------|
| `backup` | Create a new backup (default) |
| `restore <name>` | Restore from a specific backup |
| `list` | List all available backups |
| `help` | Show help information |

### Examples

```bash
# Create backup
./backup.sh
./backup.sh backup

# List backups
./backup.sh list

# Restore specific backup
./backup.sh restore IMM-Marketing-Hub_backup_20241201_143022

# Show help
./backup.sh help
```

## ⏰ Automated Backup Setup

### Cron Job Setup Commands

```bash
./setup-backup-cron.sh [COMMAND]
```

| Command | Description | Schedule |
|---------|-------------|----------|
| `daily` | Daily backup at 2 AM | `0 2 * * *` |
| `weekly` | Weekly backup on Sunday at 3 AM | `0 3 * * 0` |
| `custom <schedule>` | Custom backup schedule | User-defined |
| `show` | Show current cron jobs | - |
| `remove` | Remove all backup cron jobs | - |

### Schedule Examples

```bash
# Daily at 2 AM
./setup-backup-cron.sh daily

# Weekly on Sunday at 3 AM
./setup-backup-cron.sh weekly

# Custom schedules
./setup-backup-cron.sh custom '0 4 * * *'      # Daily at 4 AM
./setup-backup-cron.sh custom '0 6 * * 1-5'    # Weekdays at 6 AM
./setup-backup-cron.sh custom '0 1 * * 0'      # Sunday at 1 AM
./setup-backup-cron.sh custom '0 */6 * * *'    # Every 6 hours
```

### Cron Schedule Format

```
minute hour day month weekday
```

| Field | Range | Description |
|-------|-------|-------------|
| minute | 0-59 | Minute of the hour |
| hour | 0-23 | Hour of the day |
| day | 1-31 | Day of the month |
| month | 1-12 | Month of the year |
| weekday | 0-7 | Day of the week (0=Sunday) |

## 📂 Backup Storage

### Default Location
```
~/backups/IMM-Marketing-Hub/
```

### Backup File Structure
```
~/backups/IMM-Marketing-Hub/
├── IMM-Marketing-Hub_backup_20241201_143022_database.db
├── IMM-Marketing-Hub_backup_20241201_143022_code.tar.gz
├── IMM-Marketing-Hub_backup_20241201_143022_media.tar.gz
├── IMM-Marketing-Hub_backup_20241201_143022_git.bundle
├── IMM-Marketing-Hub_backup_20241201_143022_config.tar.gz
├── IMM-Marketing-Hub_backup_20241201_143022_system_info.txt
└── IMM-Marketing-Hub_backup_20241201_143022_summary.txt
```

### File Descriptions

| File | Description | Size |
|------|-------------|------|
| `*_database.db` | SQLite database backup | ~1-10 MB |
| `*_code.tar.gz` | Compressed source code | ~5-20 MB |
| `*_media.tar.gz` | Compressed media files | Variable |
| `*_git.bundle` | Git repository bundle | ~1-5 MB |
| `*_config.tar.gz` | Configuration files | ~1 MB |
| `*_system_info.txt` | System information | ~1 KB |
| `*_summary.txt` | Backup summary | ~1 KB |

## 🔄 Restoration Process

### Complete Restoration

```bash
# Restore from a specific backup
./backup.sh restore IMM-Marketing-Hub_backup_20241201_143022
```

This will restore:
1. **Code**: All source files and configurations
2. **Database**: Complete database with all data
3. **Media**: All uploaded and generated media files

### Selective Restoration

You can manually restore specific components:

```bash
# Restore only database
cp ~/backups/IMM-Marketing-Hub/IMM-Marketing-Hub_backup_20241201_143022_database.db user_data/imm_marketing_hub.db

# Restore only code
tar -xzf ~/backups/IMM-Marketing-Hub/IMM-Marketing-Hub_backup_20241201_143022_code.tar.gz -C /tmp
rsync -av /tmp/IMM-Marketing-Hub_backup_20241201_143022/ ./

# Restore only media
tar -xzf ~/backups/IMM-Marketing-Hub/IMM-Marketing-Hub_backup_20241201_143022_media.tar.gz -C app
```

## 🛡️ Security & Privacy

### Data Protection
- **Local Storage**: All backups stored locally
- **No Cloud Sync**: Complete privacy control
- **Encryption**: Consider encrypting backup directory
- **Access Control**: Backup directory permissions

### Backup Security
```bash
# Encrypt backup directory (optional)
chmod 700 ~/backups/IMM-Marketing-Hub/

# Or use disk encryption
# macOS: FileVault
# Linux: LUKS
# Windows: BitLocker
```

## 📊 Monitoring & Maintenance

### Backup Logs
```bash
# View backup logs
tail -f /tmp/imm-backup.log

# Check backup status
./backup.sh list
```

### Cleanup
The backup system automatically:
- Keeps the last 10 backups
- Removes older backups to save space
- Creates backup summaries

### Manual Cleanup
```bash
# Remove old backups manually
rm -rf ~/backups/IMM-Marketing-Hub/IMM-Marketing-Hub_backup_20241101_*

# Check backup directory size
du -sh ~/backups/IMM-Marketing-Hub/
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x backup.sh
   chmod +x setup-backup-cron.sh
   ```

2. **Backup Directory Not Found**
   ```bash
   mkdir -p ~/backups/IMM-Marketing-Hub/
   ```

3. **Cron Job Not Running**
   ```bash
   # Check cron service
   sudo systemctl status cron  # Linux
   sudo launchctl list | grep cron  # macOS
   
   # Check cron logs
   tail -f /var/log/cron  # Linux
   tail -f /var/log/system.log | grep cron  # macOS
   ```

4. **Insufficient Disk Space**
   ```bash
   # Check available space
   df -h
   
   # Clean old backups
   ./backup.sh list
   # Manually remove old backups
   ```

### Backup Verification

```bash
# Verify backup integrity
tar -tzf ~/backups/IMM-Marketing-Hub/*_code.tar.gz | head -10

# Check database backup
file ~/backups/IMM-Marketing-Hub/*_database.db

# Verify git bundle
git bundle verify ~/backups/IMM-Marketing-Hub/*_git.bundle
```

## 📈 Best Practices

### Backup Strategy
1. **Daily Backups**: For active development
2. **Weekly Backups**: For stable releases
3. **Before Major Changes**: Before updates or migrations
4. **Multiple Locations**: Consider external storage

### Storage Recommendations
- **Local**: Primary backup location
- **External Drive**: Secondary backup
- **Cloud Storage**: Tertiary backup (encrypted)
- **Git Repository**: Code version control

### Testing Restorations
```bash
# Test restoration in a separate directory
mkdir test-restore
cd test-restore
../backup.sh restore IMM-Marketing-Hub_backup_20241201_143022
```

## 🔗 Integration with Git

The backup system integrates with git:
- Automatically commits changes after backup
- Pushes to remote repository
- Maintains version history

### Git Integration Commands
```bash
# Manual git backup
git add .
git commit -m "Backup: $(date)"
git push origin main

# Check git status
git status
git log --oneline -5
```

## 📞 Support

### Getting Help
1. **Check Logs**: `/tmp/imm-backup.log`
2. **Verify Permissions**: Ensure scripts are executable
3. **Check Dependencies**: Ensure required tools are installed
4. **Review Documentation**: This guide and script help

### Required Tools
- `bash` (shell)
- `tar` (compression)
- `rsync` (file sync)
- `git` (version control)
- `crontab` (scheduling)

### Emergency Recovery
```bash
# Emergency restore from latest backup
LATEST_BACKUP=$(ls -t ~/backups/IMM-Marketing-Hub/ | grep backup | head -1)
./backup.sh restore "$LATEST_BACKUP"
```

---

**Backup System Version**: 1.0  
**Last Updated**: December 2024  
**Compatibility**: macOS, Linux, Windows (WSL)
