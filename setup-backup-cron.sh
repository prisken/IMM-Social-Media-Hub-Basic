#!/bin/bash

# IMM Marketing Hub - Cron Job Setup Script
# This script sets up automated backup cron jobs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$PROJECT_DIR/backup.sh"

print_status "Setting up automated backup cron jobs for IMM Marketing Hub"
print_status "Project directory: $PROJECT_DIR"
print_status "Backup script: $BACKUP_SCRIPT"

# Check if backup script exists
if [ ! -f "$BACKUP_SCRIPT" ]; then
    print_error "Backup script not found: $BACKUP_SCRIPT"
    exit 1
fi

# Check if backup script is executable
if [ ! -x "$BACKUP_SCRIPT" ]; then
    print_status "Making backup script executable..."
    chmod +x "$BACKUP_SCRIPT"
fi

# Function to add cron job
add_cron_job() {
    local schedule="$1"
    local description="$2"
    
    # Create cron job entry
    local cron_entry="$schedule cd $PROJECT_DIR && $BACKUP_SCRIPT > /tmp/imm-backup.log 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
        print_warning "Cron job already exists for backup script"
        return 1
    fi
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
    
    print_success "Added cron job: $description"
    print_status "Schedule: $schedule"
}

# Function to show current cron jobs
show_cron_jobs() {
    print_status "Current cron jobs:"
    crontab -l 2>/dev/null | grep -E "(imm|backup)" || echo "No IMM Marketing Hub cron jobs found"
}

# Function to remove cron jobs
remove_cron_jobs() {
    print_status "Removing IMM Marketing Hub cron jobs..."
    
    # Remove cron jobs containing the backup script
    crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" | crontab -
    
    print_success "Cron jobs removed"
}

# Function to show help
show_help() {
    echo "IMM Marketing Hub - Cron Job Setup"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  daily      Set up daily backup at 2 AM"
    echo "  weekly     Set up weekly backup on Sunday at 3 AM"
    echo "  custom     Set up custom backup schedule"
    echo "  show       Show current cron jobs"
    echo "  remove     Remove all IMM Marketing Hub cron jobs"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 daily                    # Daily backup at 2 AM"
    echo "  $0 weekly                   # Weekly backup on Sunday at 3 AM"
    echo "  $0 custom '0 4 * * *'       # Custom schedule (4 AM daily)"
    echo "  $0 show                     # Show current cron jobs"
    echo "  $0 remove                   # Remove all cron jobs"
    echo ""
    echo "Cron Schedule Format:"
    echo "  minute hour day month weekday"
    echo "  0 2 * * *     = Daily at 2 AM"
    echo "  0 3 * * 0     = Weekly on Sunday at 3 AM"
    echo "  0 4 * * 1-5   = Weekdays at 4 AM"
}

# Main script logic
case "${1:-help}" in
    "daily")
        print_status "Setting up daily backup at 2 AM..."
        add_cron_job "0 2 * * *" "Daily backup at 2 AM"
        show_cron_jobs
        ;;
    "weekly")
        print_status "Setting up weekly backup on Sunday at 3 AM..."
        add_cron_job "0 3 * * 0" "Weekly backup on Sunday at 3 AM"
        show_cron_jobs
        ;;
    "custom")
        if [ -z "$2" ]; then
            print_error "Please provide a cron schedule"
            echo "Example: $0 custom '0 4 * * *'"
            exit 1
        fi
        print_status "Setting up custom backup schedule..."
        add_cron_job "$2" "Custom backup schedule: $2"
        show_cron_jobs
        ;;
    "show")
        show_cron_jobs
        ;;
    "remove")
        remove_cron_jobs
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

print_status "Setup completed!"
print_status "Backup logs will be written to: /tmp/imm-backup.log"
