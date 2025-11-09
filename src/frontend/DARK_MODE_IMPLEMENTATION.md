# Dark Mode Implementation Guide

## 🌙 Tổng quan

Admin Panel đã được cập nhật để hỗ trợ dark mode hoàn chỉnh với hệ thống theming linh hoạt và dễ sử dụng.

## 🎨 Design System

### Color Palette

#### Light Mode
- **Background**: `#ffffff` (trắng)
- **Foreground**: `#0f172a` (gần đen)
- **Muted**: `#64748b` (xám)
- **Border**: `#e2e8f0` (xám nhạt)
- **Primary**: `#3b82f6` (xanh dương)

#### Dark Mode
- **Background**: `#0f172a` (gần đen)
- **Foreground**: `#f8fafc` (trắng)
- **Muted**: `#94a3b8` (xám sáng)
- **Border**: `#334155` (xám tối)
- **Primary**: `#60a5fa` (xanh dương sáng)

## 🛠 Technical Implementation

### 1. CSS Variables System

```css
:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --primary: #3b82f6;
}

html[data-theme="dark"] {
  --background: #0f172a;
  --foreground: #f8fafc;
  --muted: #94a3b8;
  --border: #334155;
  --primary: #60a5fa;
}
```

### 2. Tailwind CSS Integration

```tsx
// Sử dụng semantic color tokens
<div className="bg-background text-foreground">
  <h1 className="text-foreground">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

### 3. Component Updates

Tất cả components đã được cập nhật để sử dụng semantic color tokens:

#### Before (Hard-coded colors)
```tsx
<div className="bg-white text-gray-900 border-gray-200">
  <h1 className="text-gray-900">Title</h1>
  <p className="text-gray-600">Description</p>
</div>
```

#### After (Semantic tokens)
```tsx
<div className="bg-background text-foreground border-border">
  <h1 className="text-foreground">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

## 📱 Responsive Design

### Mobile Support
- Dark mode hoạt động trên tất cả breakpoints
- Touch-friendly interactions
- Optimized for mobile viewing

### Desktop Support
- Full sidebar navigation
- Hover states
- Keyboard navigation

## 🎯 Key Features

### 1. Automatic Theme Detection
```tsx
const { theme, setTheme } = useTheme();

// Tự động phát hiện system preference
useEffect(() => {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  setTheme(systemTheme);
}, []);
```

### 2. Smooth Transitions
```css
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

### 3. Status Badges
```tsx
// Adaptive status badges
const getStatusBadge = (status: string) => {
  const styles = {
    published: 'bg-green-500/10 text-green-600 dark:text-green-400',
    draft: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    archived: 'bg-muted text-muted-foreground'
  };
  // ...
};
```

## 🔧 Implementation Details

### 1. Layout Updates

#### Admin Layout (`/admin/layout.tsx`)
- Sidebar: `bg-card border-border`
- Navigation: `text-muted-foreground hover:bg-accent`
- Active states: `bg-primary/10 text-primary`

#### Dashboard (`/admin/page.tsx`)
- Cards: `bg-card text-foreground`
- Stats: `text-muted-foreground`
- Progress bars: `bg-muted` với `bg-primary` fill

### 2. Component Updates

#### Cards
```tsx
<Card className="p-6">
  <h3 className="text-lg font-semibold text-foreground">Title</h3>
  <p className="text-muted-foreground">Description</p>
</Card>
```

#### Buttons
```tsx
<Button variant="outline" className="border-border hover:bg-accent">
  Action
</Button>
```

#### Inputs
```tsx
<Input 
  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
  placeholder="Enter text..."
/>
```

### 3. Status Indicators

#### Role Badges
```tsx
const getRoleBadge = (role: string) => {
  const styles = {
    student: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    instructor: 'bg-green-500/10 text-green-600 dark:text-green-400',
    admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  };
  // ...
};
```

#### Status Badges
```tsx
const getStatusBadge = (status: string) => {
  const styles = {
    active: 'bg-green-500/10 text-green-600 dark:text-green-400',
    inactive: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    banned: 'bg-red-500/10 text-red-600 dark:text-red-400'
  };
  // ...
};
```

## 🎨 Visual Examples

### Light Mode
- Clean, bright interface
- High contrast text
- Subtle shadows and borders
- Blue accent colors

### Dark Mode
- Dark background with light text
- Reduced eye strain
- Consistent color hierarchy
- Bright accent colors for visibility

## 🚀 Usage

### Theme Toggle
```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
```

### Custom Theme Colors
```css
/* Override specific colors */
:root {
  --primary: #your-color;
  --accent: #your-accent-color;
}
```

## 📊 Performance

### Optimizations
- CSS variables for efficient theming
- Minimal re-renders
- Smooth transitions
- Optimized for both light and dark modes

### Bundle Size
- No additional dependencies
- Leverages existing Tailwind CSS
- Minimal CSS overhead

## 🔍 Testing

### Manual Testing
1. Toggle between light/dark modes
2. Check all components render correctly
3. Verify text contrast ratios
4. Test on different screen sizes

### Accessibility Testing
- WCAG AA compliance
- Proper contrast ratios
- Screen reader compatibility
- Keyboard navigation

## 🎯 Best Practices

### 1. Use Semantic Tokens
```tsx
// ✅ Good
<div className="bg-background text-foreground">

// ❌ Avoid
<div className="bg-white text-black dark:bg-black dark:text-white">
```

### 2. Consistent Spacing
```tsx
// ✅ Good
<div className="p-6 space-y-4">

// ❌ Avoid
<div className="p-6 space-y-4 dark:p-6 dark:space-y-4">
```

### 3. Status Colors
```tsx
// ✅ Good
<span className="bg-green-500/10 text-green-600 dark:text-green-400">

// ❌ Avoid
<span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
```

## 🐛 Troubleshooting

### Common Issues

1. **Colors not updating**
   - Check CSS variables are defined
   - Verify theme provider is working
   - Ensure components use semantic tokens

2. **Poor contrast**
   - Test with accessibility tools
   - Adjust color values if needed
   - Use proper semantic tokens

3. **Inconsistent theming**
   - Audit all hard-coded colors
   - Replace with semantic tokens
   - Test across all components

## 📈 Future Enhancements

### Planned Features
- Custom theme builder
- More color variations
- Advanced accessibility options
- Theme persistence per user

### Potential Improvements
- CSS-in-JS theming
- Dynamic color generation
- Advanced contrast adjustments
- Theme preview mode

## 🎉 Conclusion

Dark mode implementation provides:
- ✅ Complete theme support
- ✅ Consistent design system
- ✅ Accessibility compliance
- ✅ Performance optimization
- ✅ Developer-friendly API
- ✅ User experience enhancement

The implementation follows modern best practices and provides a solid foundation for future theming enhancements.
