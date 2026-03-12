# Mobile-First Component Examples

Quick reference for using the new mobile-optimized form components.

---

## FormField Component

### Basic Input
```tsx
import { FormField } from '@/components/FormField';

<FormField
  type="text"
  label="Full Name"
  placeholder="John Doe"
/>
```

### Email Input with Error
```tsx
<FormField
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  error="Invalid email format"
/>
```

### With Helper Text
```tsx
<FormField
  type="password"
  label="Password"
  placeholder="••••••••"
  helperText="Must be at least 8 characters"
/>
```

### Different Sizes
```tsx
{/* Small - compact inputs */}
<FormField size="sm" label="Promo Code" />

{/* Medium - default, recommended for most forms */}
<FormField size="md" label="Email" />

{/* Large - prominent inputs */}
<FormField size="lg" label="Account Number" />
```

---

## Button Component

### Primary Action
```tsx
import { Button } from '@/components/Button';

<Button variant="primary" onClick={handleSubmit}>
  Save Changes
</Button>
```

### Secondary Action
```tsx
<Button variant="secondary">
  Share Profile
</Button>
```

### Outline Button
```tsx
<Button variant="outline">
  Cancel
</Button>
```

### Danger Action
```tsx
<Button variant="danger">
  Delete Account
</Button>
```

### Full-Width (Mobile Optimized)
```tsx
<Button fullWidth>
  Continue
</Button>
```

### Different Sizes
```tsx
{/* Small - secondary actions */}
<Button size="sm">Skip</Button>

{/* Medium - primary actions (default) */}
<Button size="md">Submit</Button>

{/* Large - prominent actions */}
<Button size="lg">Get Started</Button>
```

### With Icon
```tsx
import { Heart } from 'lucide-react';

<Button icon={<Heart size={20} />}>
  Save
</Button>
```

### Loading State
```tsx
<Button loading>
  Processing...
</Button>
```

---

## FormContainer Component

### Simple Form
```tsx
import { FormContainer } from '@/components/FormContainer';

<FormContainer
  title="Edit Profile"
  description="Update your profile information"
  spacing="normal"
>
  <FormField label="Name" />
  <FormField label="Email" type="email" />
  <FormField label="Location" />
  <FormField label="Bio" />
  <Button fullWidth>Save Profile</Button>
</FormContainer>
```

### Two-Column Form
```tsx
<FormContainer
  title="Create Account"
  columns={2}  {/* Mobile: 1 column, Tablet+: 2 columns */}
>
  <FormField label="First Name" />
  <FormField label="Last Name" />
  <FormField label="Email" type="email" columns={2} />
  <Button fullWidth>Create Account</Button>
</FormContainer>
```

### Three-Column on Desktop
```tsx
<FormContainer
  title="User Directory"
  columns={3}  {/* Mobile: 1, Tablet: 2, Desktop: 3 */}
  spacing="relaxed"
>
  <FormField label="First Name" />
  <FormField label="Middle Name" />
  <FormField label="Last Name" />
  <FormField label="Email" />
  <FormField label="Phone" />
  <FormField label="City" />
  <Button>Search</Button>
</FormContainer>
```

### Compact Spacing
```tsx
<FormContainer spacing="compact">
  {/* Dense form for mobile-friendly inline editing */}
</FormContainer>
```

---

## Complete Login Form Example

```tsx
import { FormContainer } from '@/components/FormContainer';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';
import { Mail } from 'lucide-react';
import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Your login logic here
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        setError('Invalid email or password');
        return;
      }
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black p-4">
      <FormContainer
        title="Welcome Back"
        description="Sign in to your AmoraVibe account"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        <FormField
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<Mail size={18} />}
        />
        
        <FormField
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Button
          type="submit"
          fullWidth
          loading={loading}
        >
          Sign In
        </Button>
        
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/onboarding" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </FormContainer>
    </div>
  );
}
```

---

## Profile Edit Modal Example

```tsx
import { FormContainer } from '@/components/FormContainer';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';
import { useState } from 'react';

export default function ProfileEditModal({ profile, onClose }) {
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error('Failed to update profile');
      
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md md:max-h-[90vh] overflow-auto">
        <FormContainer
          title="Edit Profile"
          columns={1}
          onSubmit={handleSubmit}
          className="p-6"
        >
          <FormField
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          
          <FormField
            type="number"
            label="Age"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
          />
          
          <FormField
            label="Location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
          
          <FormField
            label="About"
            value={formData.about}
            onChange={(e) => handleChange('about', e.target.value)}
          />
          
          <div className="flex gap-3 col-span-full">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              Save
            </Button>
          </div>
        </FormContainer>
      </div>
    </div>
  );
}
```

---

## Migration Guide

### Before (Old Pattern)
```tsx
// Old input
<input
  type="email"
  className="w-full px-4 py-2 border rounded"
  placeholder="Email"
/>

// Old button
<button className="px-6 py-2 bg-blue-600 text-white rounded">
  Submit
</button>
```

### After (New Pattern)
```tsx
// New input
<FormField
  type="email"
  label="Email"
  placeholder="Email"
/>

// New button
<Button fullWidth>
  Submit
</Button>
```

---

## Responsive Behaviors

### FormField
- **Mobile:** 44px minimum height, full width
- **Tablet+:** Auto width, scales text size
- **Focus:** 2px violet outline with 2px offset

### Button
- **Mobile:** 48px height, full-width by default
- **Tablet+:** 44-48px height based on size prop
- **Hover:** Scales to 1.02x with shadow
- **Active:** Scales to 0.98x (press effect)

### FormContainer
- **Mobile:** Single column, 12px gap
- **Tablet:** Adapts grid based on columns prop
- **Desktop:** Full responsive grid layout

---

## Accessibility Notes

✅ All components enforce WCAG 2.1 Level AA compliance:
- Minimum 44×44px touch targets
- Focus-visible keyboard navigation
- Proper semantic HTML
- Color contrast ≥4.5:1
- Labels properly associated with inputs
- Error states clearly indicated
- Loading states with accessible spinner

---

## Tips for Best Results

1. **Always use `fullWidth` on mobile:**
   ```tsx
   <Button fullWidth>Action</Button>
   ```

2. **Stack forms vertically on mobile:**
   ```tsx
   <FormContainer columns={1}>
     {/* uses 1 column on mobile, scales up on tablet */}
   </FormContainer>
   ```

3. **Responsive images inside forms:**
   ```tsx
   <Image 
     src="/avatar.jpg" 
     width={160} 
     height={160}
     className="w-full md:w-40 h-auto"
   />
   ```

4. **Use container queries for nested responsiveness:**
   ```tsx
   <div className="@container">
     {/* responsive to container, not viewport */}
   </div>
   ```

---

**More Examples:** See [MOBILE_CODE_PATTERNS.md](./MOBILE_CODE_PATTERNS.md)  
**Component API:** See component files in `src/components/`
