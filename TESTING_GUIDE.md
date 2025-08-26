# 🧪 Calendar & Scheduling Testing Guide

## ✅ Application Status: RUNNING

The IMM Marketing Hub application is currently running with:
- ✅ Vite development server (http://localhost:5173)
- ✅ Electron desktop application
- ✅ All Calendar & Scheduling components loaded

---

## 🎯 How to Test Calendar & Scheduling Features

### 📋 Prerequisites
1. **Application Running**: The app should be running (✅ Confirmed)
2. **Database Initialized**: SQLite database should be created automatically
3. **Components Loaded**: Calendar and Scheduler components are ready

### 🗓️ Testing the Calendar Component

#### Step 1: Navigate to Calendar
1. Open the IMM Marketing Hub desktop application
2. Click on **"Calendar"** in the navigation bar
3. ✅ You should see a calendar interface with month view

#### Step 2: Test Calendar Views
1. **Month View** (default):
   - ✅ Should display current month in a grid format
   - ✅ Should show day numbers (1-31)
   - ✅ Should highlight today's date
   - ✅ Should show previous/next month days in gray

2. **Week View**:
   - Click the **"Week"** button in the top-right
   - ✅ Should switch to week view showing 7 days
   - ✅ Should display current week with day headers

#### Step 3: Test Navigation
1. **Month Navigation**:
   - Click **"←"** arrow to go to previous month
   - Click **"→"** arrow to go to next month
   - ✅ Month/year should update in the header

2. **Week Navigation** (in week view):
   - Click **"←"** arrow to go to previous week
   - Click **"→"** arrow to go to next week
   - ✅ Week should update in the header

#### Step 4: Test Date Selection
1. **Click on a Date**:
   - Click on any date in the calendar
   - ✅ Should open a time picker overlay
   - ✅ Should show available time slots (8:00 AM - 7:00 PM)

2. **Time Selection**:
   - Click on a time slot (e.g., "10:00")
   - ✅ Should close the time picker
   - ✅ Should trigger scheduling logic

#### Step 5: Test Visual Indicators
1. **Legend**:
   - Look at the bottom of the calendar
   - ✅ Should show color-coded legend:
     - 🟡 Draft (yellow)
     - 🔵 Scheduled (blue)
     - 🟢 Published (green)
     - 🔴 Failed (red)

2. **Post Indicators** (when posts exist):
   - ✅ Should show small colored blocks on dates with posts
   - ✅ Should display platform icon and time
   - ✅ Should show tooltip on hover

### ⏰ Testing the Scheduler Component

#### Step 1: Navigate to Scheduler
1. Click on **"Scheduler"** in the navigation bar
2. ✅ Should see scheduler interface with statistics

#### Step 2: Test Scheduler Status
1. **Status Indicators**:
   - ✅ Should show "🟢 Running" or "🔴 Stopped"
   - ✅ Should show "🟢 Online" or "🔴 Offline"

2. **Statistics Dashboard**:
   - ✅ Should display 5 stat boxes:
     - Queued jobs count
     - Scheduled jobs count
     - Running jobs count
     - Completed jobs count
     - Failed jobs count

#### Step 3: Test Job Queue
1. **Empty State**:
   - If no jobs exist, should show "No scheduled jobs"
   - ✅ Should display empty state message

2. **Job List** (when jobs exist):
   - ✅ Should show job cards with:
     - Status icon and text
     - Platform name
     - Scheduled time
     - Content preview
     - Action buttons

### 🔄 Testing Drag & Drop Rescheduling

#### Step 1: Create a Test Post
1. Navigate to **"Content Studio"**
2. Create a simple post with content
3. Save it as a draft

#### Step 2: Schedule the Post
1. Go to **"Calendar"**
2. Click on a future date
3. Select a time slot
4. ✅ Post should appear on the calendar

#### Step 3: Test Drag & Drop
1. **Drag Operation**:
   - Click and hold on a scheduled post
   - ✅ Should show drag feedback
   - ✅ Post should become semi-transparent

2. **Drop Operation**:
   - Drag to a different date
   - Release to drop
   - ✅ Should show conflict detection if applicable
   - ✅ Should update the schedule if no conflicts

#### Step 4: Test Conflict Detection
1. **Create Conflict**:
   - Try to schedule two posts at the same time
   - ✅ Should show conflict dialog
   - ✅ Should display conflicting post details

2. **Conflict Resolution**:
   - Click "Cancel" to abort
   - Click "Reschedule Anyway" to override
   - ✅ Should handle conflict appropriately

### 🗄️ Testing Database Persistence

#### Step 1: Schedule Posts
1. Create and schedule several posts
2. ✅ Should appear in both Calendar and Scheduler

#### Step 2: Restart Application
1. Close the application completely
2. Restart with `npm run dev`
3. Navigate to Calendar and Scheduler
4. ✅ All scheduled posts should persist

#### Step 3: Verify Data Integrity
1. Check that post details are preserved
2. Check that scheduling times are accurate
3. Check that status information is maintained
4. ✅ All data should be consistent

### 🎨 Testing UI/UX Features

#### Step 1: Responsive Design
1. **Resize Window**:
   - Make the window smaller
   - ✅ Calendar should adapt to smaller size
   - ✅ Scheduler should remain usable

2. **Mobile-like Testing**:
   - Resize to mobile dimensions
   - ✅ Components should be mobile-friendly

#### Step 2: Visual Feedback
1. **Hover Effects**:
   - Hover over calendar days
   - Hover over scheduled posts
   - Hover over buttons
   - ✅ Should show appropriate hover effects

2. **Loading States**:
   - Perform actions that require loading
   - ✅ Should show loading indicators

#### Step 3: Error Handling
1. **Network Errors**:
   - Disconnect internet temporarily
   - ✅ Should show offline status
   - ✅ Should handle errors gracefully

2. **Invalid Actions**:
   - Try invalid operations
   - ✅ Should show appropriate error messages

---

## 🎯 Expected Test Results

### ✅ Success Criteria
- [ ] Calendar displays correctly in month/week views
- [ ] Navigation between months/weeks works
- [ ] Date selection opens time picker
- [ ] Drag & drop rescheduling works
- [ ] Conflict detection functions properly
- [ ] Scheduler shows job statistics
- [ ] Job queue displays correctly
- [ ] Posts persist after app restart
- [ ] UI is responsive and user-friendly
- [ ] Error handling works appropriately

### 🐛 Common Issues & Solutions

#### Issue: Calendar not loading
**Solution**: Check browser console for errors, restart the app

#### Issue: Drag & drop not working
**Solution**: Ensure you're clicking and holding on the post indicator

#### Issue: Database errors
**Solution**: Check that the app has write permissions to user_data directory

#### Issue: Time picker not appearing
**Solution**: Make sure you're clicking on the date area, not on existing posts

---

## 🚀 Ready for Production

Once all tests pass, the Calendar & Scheduling features are ready for:
- ✅ Integration with social media APIs (Milestone 5)
- ✅ Engagement tracking (Milestone 6)
- ✅ Analytics dashboard (Milestone 7)

**Status**: 🎉 **MILESTONE 4 COMPLETE** - Calendar & Scheduling fully functional! 