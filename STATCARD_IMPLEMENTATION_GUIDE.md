# Responsive Stats Cards Implementation Guide

## What's Been Done ✅

1. **Created ReusableStatCard Component** - `/frontend/src/components/StatCard.tsx`
   - Clickable button-based stats cards
   - Supports 6 color themes: blue, red, green, purple, orange, teal
   - Shows active state with ring and background highlight
   - Displays label, value, icon, and subtext

2. **Pages Updated with StatCard** ✅
   - ✅ Dashboard (/admin) - Revenue, Bookings, Check-ins, Occupancy
   - ✅ Bookings (/admin/bookings) - Total, Pending, Checked In, Revenue
   - ✅ Rooms (/admin/rooms) - Total, Available, Occupied, Out of Service

## Pattern for Remaining Pages

### Step 1: Import StatCard
```typescript
import StatCard from '../../../components/StatCard'
```

### Step 2: Add Filter State
```typescript
const [pageFilter, setPageFilter] = useState<'all' | 'filter1' | 'filter2'>('all')
```

### Step 3: Replace Stats Cards
Replace each old stat card div with:
```typescript
<StatCard
  label="Card Title"
  value={count || "$amount"}
  icon="😀"
  color="blue" // blue|red|green|purple|orange|teal
  subtext="Additional info"
  onClick={() => setPageFilter('filter1')}
  isActive={pageFilter === 'filter1'}
/>
```

### Step 4: Add Filter Logic
Update your display/filtering logic to respond to `pageFilter` state

## Pages Still Needing Updates

### 1. Housekeeping (/admin/housekeeping)
Stats: Clean & Ready, Dirty, Cleaning, Inspection, Maintenance
- Convert gradient cards to StatCard components
- Add filter state for room status filtering

### 2. Staff (/admin/staff)
Stats: Total Staff, Active Now, On Leave, New Hires
- Use icons: 👥, ✓, 🏖️, 🎉
- Filter by staff status

### 3. Guests (/admin/guests)
Stats: Total Guests, VIP Members, Frequent Guests, Avg. Spend
- Use icons: 👥, ⭐, 🏨, 💰
- Filter by guest type

### 4. Analytics (/admin/analytics)
Stats: Total Revenue, Occupancy Rate, ADR, RevPAR
- Use icons: 💰, 📊, 💵, 📈
- Show trend indicators (↑/↓%)

### 5. Promotions (/admin/promotions)
Stats: Active Promos, Redemptions, Revenue Impact, Avg. Discount
- Use icons: 🏷️, ✓, 💰, 📊
- Filter by promo status

### 6. Reviews (/admin/reviews)
Stats: Average Rating, Total Reviews, Pending Response, This Month
- Use icons: ⭐, 📝, ⏳, 📊
- Filter by review status

### 7. Settings (/admin/settings)
- This page has buttons/sections, not stats - skip for now

## Example Implementation

```typescript
// 1. Add import
import StatCard from '../../../components/StatCard'

// 2. Add filter state
const [staffFilter, setStaffFilter] = useState<'all' | 'active' | 'onleave' | 'newhires'>('all')

// 3. Replace stats cards in render
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <StatCard
    label="Total Staff"
    value={totalStaff}
    icon="👥"
    color="blue"
    subtext="Current headcount"
    onClick={() => setStaffFilter('all')}
    isActive={staffFilter === 'all'}
  />
  <StatCard
    label="Active Now"
    value={activeStaff}
    icon="✓"
    color="green"
    subtext="Currently working"
    onClick={() => setStaffFilter('active')}
    isActive={staffFilter === 'active'}
  />
  {/* ... more cards */}
</div>

// 4. Update filtering logic
const displayedItems = (() => {
  switch(staffFilter) {
    case 'active':
      return items.filter(i => i.status === 'active')
    case 'onleave':
      return items.filter(i => i.status === 'onleave')
    // ... more filtering
    default:
      return items
  }
})()
```

## Key Benefits
- ✅ Consistent UI across all admin pages
- ✅ Clickable cards that filter content automatically
- ✅ Visual feedback showing active filter
- ✅ Responsive design on all screen sizes
- ✅ Reusable component reduces code duplication

## Implementation Order (Priority)
1. Housekeeping (high frequency use)
2. Staff & Guests (operational dashboard)
3. Analytics & Promotions (business metrics)
4. Reviews (lower priority)

