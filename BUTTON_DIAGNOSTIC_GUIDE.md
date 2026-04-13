# Button Diagnostic Guide

## How to Test if Buttons Are Working

### TEST 1: Check Browser Console (MOST IMPORTANT)

1. **Open the page:** http://localhost:3000/rooms?hotel=uk
2. **Open Browser Console:**
   - Windows/Linux: Press `F12` or `Ctrl+Shift+I`
   - Mac: Press `Cmd+Option+I`
3. **Click the "Console" tab**
4. **Select dates in the booking bar:**
   - Click "Check-in" field → Pick a date
   - Click "Check-out" field → Pick a date
5. **Click "Check Availability" button**
6. **Check the console output:**

**You should see:**
```
Button clicked!
Check Availability clicked {checkInDate: "2024-XX-XX", checkOutDate: "2024-XX-XX", guests: "2 Guests"}
Dates selected, scrolling to rooms
```

**If you see this:** ✅ Button IS working
**If you don't see this:** ❌ Button click event is not firing

---

### TEST 2: Visual Feedback

When you click the "Check Availability" button:

1. **Button should:**
   - Scale down slightly when you press (active state)
   - Scale up when you hover
   - Change cursor to pointer

2. **Toast notification should appear at TOP of page:**
   - White box with shadow
   - Gold/accent colored left border
   - Large emoji icon on left
   - Message text
   - Stays for 3-4 seconds then disappears

---

### TEST 3: Page Scroll

If dates are selected and you click "Check Availability":
- Page should automatically scroll down to "Our Rooms & Suites" section
- This proves the handler function executed completely

---

### TEST 4: Try Other Buttons

**Category Filter Buttons:**
- Click "All Rooms" or any category name
- These should filter the room cards instantly
- If these work → React state is working

**"Book Now" buttons on room cards:**
- Click any "Book Now" button
- Should show toast at top
- If this works → Toast system is working

---

## Common Issues & Solutions

### Issue 1: Toast Not Visible
**Problem:** Button works but you don't see the toast
**Solution:** 
- Look at the VERY TOP of the page
- Toast appears below the navbar (top-24)
- It has z-index 99999 (should be on top of everything)
- White background with large shadow

### Issue 2: Console Shows Errors
**Problem:** Red error messages in console
**Solution:** 
- Copy the error message
- This indicates a JavaScript error preventing execution

### Issue 3: Nothing Happens at All
**Problem:** No console logs, no toast, no scroll
**Possible causes:**
1. Page didn't fully load - Wait for compilation
2. JavaScript is disabled - Enable it
3. Button is covered by another element - Check with DevTools

**Debug Steps:**
1. Right-click the "Check Availability" button
2. Click "Inspect" 
3. In Elements tab, check if the button has `onClick` attribute
4. In Console tab, type: `document.querySelector('button').click()`
5. This should trigger the button programmatically

---

## What to Report Back

Please tell me:
1. ✅ or ❌ Do you see console logs when clicking?
2. ✅ or ❌ Do you see the white toast notification at the top?
3. ✅ or ❌ Does the page scroll to rooms section?
4. ✅ or ❌ Do category filter buttons work?
5. ✅ or ❌ Do "Book Now" buttons on room cards work?
6. What browser are you using? (Chrome, Firefox, Edge, etc.)
7. Any red errors in the console? (copy-paste them)

This will help me identify the EXACT issue!
