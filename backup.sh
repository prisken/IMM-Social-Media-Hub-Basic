#!/bin/bash

# IMM Marketing Hub - Automated Backup Script
# This script creates automated backups of the project

set -e  # Exit on any error

# Configuration
PROJECT_NAME="IMM-Marketing-Hub"
BACKUP_DIR="$HOME/backups/$PROJECT_NAME"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${PROJECT_NAME}_backup_${DATE}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        print_status "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Function to create database backup
backup_database() {
    print_status "Creating database backup..."
    
    if [ -f "user_data/imm_marketing_hub.db" ]; then
        cp "user_data/imm_marketing_hub.db" "$BACKUP_DIR/${BACKUP_NAME}_database.db"
        print_success "Database backed up to: $BACKUP_DIR/${BACKUP_NAME}_database.db"
    else
        print_warning "Database file not found, skipping database backup"
    fi
}

# Function to create code backup
backup_code() {
    print_status "Creating code backup..."
    
    # Create temporary directory for backup
    TEMP_DIR="/tmp/${BACKUP_NAME}"
    mkdir -p "$TEMP_DIR"
    
    # Copy project files (excluding node_modules, dist, etc.)
    rsync -av --exclude='node_modules' \
              --exclude='dist' \
              --exclude='dist-electron' \
              --exclude='.git' \
              --exclude='user_data/imm_marketing_hub.db' \
              --exclude='app/media/generated' \
              --exclude='app/media/variants' \
              --exclude='app/media/thumbnails' \
              --exclude='app/media/uploads' \
              --exclude='*.log' \
              --exclude='.DS_Store' \
              . "$TEMP_DIR/"
    
    # Create tar archive
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_code.tar.gz" -C /tmp "$BACKUP_NAME"
    
    # Clean up temporary directory
    rm -rf "$TEMP_DIR"
    
    print_success "Code backed up to: $BACKUP_DIR/${BACKUP_NAME}_code.tar.gz"
}

# Function to create media backup
backup_media() {
    print_status "Creating media backup..."
    
    if [ -d "app/media" ]; then
        tar -czf "$BACKUP_DIR/${BACKUP_NAME}_media.tar.gz" -C app media
        print_success "Media backed up to: $BACKUP_DIR/${BACKUP_NAME}_media.tar.gz"
    else
        print_warning "Media directory not found, skipping media backup"
    fi
}

# Function to create git backup
backup_git() {
    print_status "Creating git backup..."
    
    if [ -d ".git" ]; then
        # Create git bundle
        git bundle create "$BACKUP_DIR/${BACKUP_NAME}_git.bundle" --all
        print_success "Git repository backed up to: $BACKUP_DIR/${BACKUP_NAME}_git.bundle"
    else
        print_warning "Git repository not found, skipping git backup"
    fi
}

# Function to create configuration backup
backup_config() {
    print_status "Creating configuration backup..."
    
    CONFIG_FILES=("package.json" "package-lock.json" "tsconfig.json" "vite.config.ts" "electron-builder.json")
    CONFIG_BACKUP_DIR="$BACKUP_DIR/${BACKUP_NAME}_config"
    mkdir -p "$CONFIG_BACKUP_DIR"
    
    for file in "${CONFIG_FILES[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$CONFIG_BACKUP_DIR/"
        fi
    done
    
    # Create tar archive of config
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" -C "$BACKUP_DIR" "${BACKUP_NAME}_config"
    rm -rf "$CONFIG_BACKUP_DIR"
    
    print_success "Configuration backed up to: $BACKUP_DIR/${BACKUP_NAME}_config.tar.gz"
}

# Function to create system info backup
backup_system_info() {
    print_status "Creating system information backup..."
    
    SYSTEM_INFO_FILE="$BACKUP_DIR/${BACKUP_NAME}_system_info.txt"
    
    {
        echo "=== IMM Marketing Hub System Information ==="
        echo "Backup Date: $(date)"
        echo "System: $(uname -a)"
        echo "Node.js Version: $(node --version 2>/dev/null || echo 'Not installed')"
        echo "npm Version: $(npm --version 2>/dev/null || echo 'Not installed')"
        echo "Git Version: $(git --version 2>/dev/null || echo 'Not installed')"
        echo "Ollama Version: $(ollama --version 2>/dev/null || echo 'Not installed')"
        echo "FFmpeg Version: $(ffmpeg -version 2>/dev/null | head -n1 || echo 'Not installed')"
        echo ""
        echo "=== Installed Ollama Models ==="
        ollama list 2>/dev/null || echo "Ollama not available"
        echo ""
        echo "=== Project Dependencies ==="
        npm list --depth=0 2>/dev/null || echo "npm not available"
    } > "$SYSTEM_INFO_FILE"
    
    print_success "System information backed up to: $SYSTEM_INFO_FILE"
}

# Function to clean old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups (keeping last 10)..."
    
    # Keep only the last 10 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +11 | xargs -r rm -rf
    cd - > /dev/null
    
    print_success "Old backups cleaned up"
}

# Function to create backup summary
create_backup_summary() {
    print_status "Creating backup summary..."
    
    SUMMARY_FILE="$BACKUP_DIR/${BACKUP_NAME}_summary.txt"
    
    {
        echo "=== IMM Marketing Hub Backup Summary ==="
        echo "Backup Date: $(date)"
        echo "Backup Name: $BACKUP_NAME"
        echo ""
        echo "=== Backup Files ==="
        ls -lh "$BACKUP_DIR" | grep "$BACKUP_NAME"
        echo ""
        echo "=== Backup Size ==="
        du -sh "$BACKUP_DIR" | grep "$BACKUP_NAME"
        echo ""
        echo "=== Total Backup Directory Size ==="
        du -sh "$BACKUP_DIR"
    } > "$SUMMARY_FILE"
    
    print_success "Backup summary created: $SUMMARY_FILE"
}

# Function to push to git (if git is available)
push_to_git() {
    if command_exists git && [ -d ".git" ]; then
        print_status "Pushing changes to git..."
        
        # Check if there are changes to commit
        if ! git diff-index --quiet HEAD --; then
            git add .
            git commit -m "Automated backup: $(date)"
            git push origin main
            print_success "Changes pushed to git repository"
        else
            print_status "No changes to commit"
        fi
    else
        print_warning "Git not available or not a git repository"
    fi
}

# Main backup function
main_backup() {
    print_status "Starting IMM Marketing Hub backup..."
    print_status "Backup directory: $BACKUP_DIR"
    print_status "Backup name: $BACKUP_NAME"
    
    # Create backup directory
    create_backup_dir
    
    # Perform backups
    backup_database
    backup_code
    backup_media
    backup_git
    backup_config
    backup_system_info
    
    # Clean up old backups
    cleanup_old_backups
    
    # Create summary
    create_backup_summary
    
    # Push to git if available
    push_to_git
    
    print_success "Backup completed successfully!"
    print_status "Backup location: $BACKUP_DIR"
}

# Function to restore backup
restore_backup() {
    if [ -z "$1" ]; then
        print_error "Please specify a backup name to restore"
        echo "Usage: $0 restore <backup_name>"
        exit 1
    fi
    
    BACKUP_NAME_TO_RESTORE="$1"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME_TO_RESTORE"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    
    print_status "Restoring backup: $BACKUP_NAME_TO_RESTORE"
    
    # Restore code
    if [ -f "$BACKUP_PATH"_code.tar.gz ]; then
        print_status "Restoring code..."
        tar -xzf "$BACKUP_PATH"_code.tar.gz -C /tmp
        rsync -av /tmp/"$BACKUP_NAME_TO_RESTORE"/ ./
        rm -rf /tmp/"$BACKUP_NAME_TO_RESTORE"
        print_success "Code restored"
    fi
    
    # Restore database
    if [ -f "$BACKUP_PATH"_database.db ]; then
        print_status "Restoring database..."
        mkdir -p user_data
        cp "$BACKUP_PATH"_database.db user_data/imm_marketing_hub.db
        print_success "Database restored"
    fi
    
    # Restore media
    if [ -f "$BACKUP_PATH"_media.tar.gz ]; then
        print_status "Restoring media..."
        mkdir -p app
        tar -xzf "$BACKUP_PATH"_media.tar.gz -C app
        print_success "Media restored"
    fi
    
    print_success "Restore completed!"
}

# Function to list available backups
list_backups() {
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    
    print_status "Available backups:"
    echo ""
    
    cd "$BACKUP_DIR"
    for backup in */; do
        if [ -d "$backup" ]; then
            backup_name=$(basename "$backup")
            backup_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup" 2>/dev/null || stat -c "%y" "$backup" 2>/dev/null)
            backup_size=$(du -sh "$backup" 2>/dev/null | cut -f1)
            echo "  $backup_name ($backup_date) - $backup_size"
        fi
    done
    cd - > /dev/null
}

# Function to show help
show_help() {
    echo "IMM Marketing Hub - Backup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  backup    Create a new backup (default)"
    echo "  restore   Restore from a backup"
    echo "  list      List available backups"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Create backup"
    echo "  $0 backup             # Create backup"
    echo "  $0 restore backup_20231201_143022  # Restore specific backup"
    echo "  $0 list               # List available backups"
    echo ""
    echo "Backup location: $BACKUP_DIR"
}

# Main script logic
case "${1:-backup}" in
    "backup")
        main_backup
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "list")
        list_backups
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
