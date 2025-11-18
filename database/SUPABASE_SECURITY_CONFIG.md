# Supabase Security Configuration Guide

This guide covers essential security configurations for your CollabSpace Supabase project.

## 🔐 Critical Security Settings

### 1. Leaked Password Protection ⚠️ **IMPORTANT**

**Status**: Currently DISABLED (needs to be enabled)

**What it does**:
Supabase Auth checks passwords against the [HaveIBeenPwned](https://haveibeenpwned.com/) database to prevent users from using compromised passwords that have been exposed in data breaches.

**Why it matters**:
- Prevents users from setting passwords that are known to be compromised
- Protects accounts from credential stuffing attacks
- Industry best practice for password security

**How to Enable**:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your CollabSpace project
3. Navigate to **Authentication** → **Policies** (or **Settings**)
4. Find **"Leaked Password Protection"** setting
5. Toggle it **ON** / **Enable**
6. Save changes

**Impact**:
- ✅ New users cannot register with compromised passwords
- ✅ Existing users changing passwords will be checked
- ⚠️ Test users with weak passwords (like `Admin@123`) may fail to create if enabled before running the bulk creation script

**Recommendation**:
- **Development**: Enable after creating test users (or use stronger test passwords)
- **Production**: **Always enable** before launching

---

### 2. Email Confirmations

**Default**: Enabled (good)

**What it does**: Requires users to confirm their email address before they can log in.

**Settings**:
- Enable email confirmations: **ON**
- Disable sign-ups: Leave **OFF** (unless you want invite-only)

**For Test Users**:
The bulk creation script auto-confirms emails using the Admin API, so test users can log in immediately even with this enabled.

---

### 3. Password Requirements

**Current Settings**: Review and adjust as needed

**Recommended Settings**:
- Minimum password length: **8 characters** (default: 6)
- Require uppercase: **Optional** (but recommended for production)
- Require lowercase: **Optional**
- Require numbers: **Optional**
- Require special characters: **Optional**

**Location**:
Authentication → Settings → Password Requirements

**Note**: Test passwords like `Admin@123` meet these requirements, but are still weak. Consider using passphrases for production.

---

### 4. Rate Limiting

**What it does**: Prevents brute force attacks by limiting authentication attempts.

**Recommended Settings**:
- Email/Password sign-in rate limit: **10 attempts per hour** (default is usually good)
- Password reset rate limit: **5 attempts per hour**

**Location**:
Authentication → Rate Limits

---

### 5. JWT Expiry

**What it does**: Controls how long authentication tokens remain valid.

**Settings to Review**:
- JWT expiry: **3600 seconds** (1 hour) - default
- Refresh token expiry: **2592000 seconds** (30 days) - default

**Location**:
Settings → API → JWT Settings

**Recommendation**: Keep defaults unless you have specific requirements.

---

### 6. Multi-Factor Authentication (MFA)

**Status**: Optional but recommended for admins

**How to Enable** (if needed):
1. Authentication → Settings
2. Enable **TOTP (Time-based One-Time Password)**
3. Users can enable MFA in their account settings

**Note**: Not required for development, but highly recommended for production admin accounts.

---

## 🛡️ Row Level Security (RLS)

**Status**: ✅ Already configured in your database

Your database already has RLS policies configured in:
- `database/SUPABASE_SETUP.sql`
- `database/SUPABASE_SECURITY_FIXES.sql`

**Verify RLS is enabled**:

```sql
-- Check which tables have RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

---

## 🔑 API Keys Management

### Anon Key (Public)
- ✅ Safe to expose in frontend code
- Limited permissions based on RLS policies
- Used for client-side operations

### Service Role Key (Secret)
- ⚠️ **NEVER** expose in frontend code
- ⚠️ **NEVER** commit to git
- ⚠️ Only use in server-side scripts (like bulk-create-users.js)
- Has admin privileges, bypasses RLS

**Current Usage**:
- Used in: `scripts/bulk-create-users.js`
- Stored in: `.env` file (gitignored)

**Security Checklist**:
- [ ] Service role key is in `.env` file
- [ ] `.env` is in `.gitignore`
- [ ] Never used in frontend code
- [ ] Rotate key if accidentally exposed

**To Rotate Service Role Key**:
1. Dashboard → Settings → API
2. Click **"Roll"** next to service_role key
3. Update `.env` file with new key
4. Old key becomes invalid

---

## 📧 Email Templates

**Location**: Authentication → Email Templates

**Templates to customize** (optional):
1. **Confirmation email** - Sent when users register
2. **Magic link** - For passwordless login (if enabled)
3. **Password reset** - For forgotten passwords
4. **Invite user** - For admin-invited users

**Current Status**: Using default templates (acceptable for development)

**Production Recommendation**: Customize templates with your branding.

---

## 🚨 Security Checklist

### Before Production Launch

- [ ] ✅ Enable leaked password protection
- [ ] ✅ Configure strong password requirements (min 8+ chars)
- [ ] ✅ Enable email confirmations
- [ ] ✅ Set appropriate rate limits
- [ ] ✅ Review and test all RLS policies
- [ ] ✅ Customize email templates
- [ ] ✅ Delete all test users
- [ ] ✅ Change default admin passwords
- [ ] ✅ Enable MFA for admin accounts
- [ ] ✅ Verify service role key is not exposed
- [ ] ✅ Set up monitoring and alerts
- [ ] ✅ Review storage bucket policies
- [ ] ✅ Enable SSL/HTTPS (Supabase handles this)

### For Development

- [ ] ✅ RLS policies tested with different user roles
- [ ] ✅ Service role key in `.env` (not committed)
- [ ] ⚠️ Leaked password protection (enable after test users created)
- [ ] ✅ Test user credentials documented
- [ ] ✅ `.env.example` updated with required variables

---

## 🔍 Security Monitoring

### Supabase Dashboard

Monitor security events in:
1. **Logs**: Real-time logs of authentication events
2. **Users**: View active users and sessions
3. **API**: Monitor API usage and potential abuse

### Key Metrics to Watch

- Failed login attempts (potential brute force)
- Unusual spike in registrations (potential spam)
- API usage patterns (potential abuse)
- Failed RLS policy checks (potential unauthorized access)

---

## 🎯 Quick Fix: Enable Leaked Password Protection

Since you're seeing this warning, here's how to fix it NOW:

### Option 1: Enable Before Creating Test Users (Recommended for Production)

1. Enable leaked password protection in Supabase Dashboard
2. Update test user passwords in `database/test_users.csv` to stronger ones:
   ```csv
   email,password,role,first_name,last_name,student_id,section
   admin1@collabspace.edu,SecureAdmin2024!Pass,admin,Sarah,Anderson,,
   teacher1@collabspace.edu,TeacherSecure2024!,teacher,Emily,Johnson,,
   student1@collabspace.edu,Student!Secure2024,student,Alex,Thompson,CS2021001,A
   ```
3. Run the bulk creation script

### Option 2: Create Test Users First (Easier for Development)

1. Run the bulk creation script with current weak passwords
2. Immediately enable leaked password protection after users are created
3. **Remember**: Change these passwords before production!

### Option 3: Disable Temporarily (Development Only)

For quick development testing:
1. Keep it disabled until you're ready for production
2. Enable it before any production deployment
3. **Never** deploy to production without enabling it

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 🆘 Support

If you encounter security issues:
1. Check Supabase Dashboard logs
2. Review RLS policies in SQL editor
3. Test with different user roles
4. Consult Supabase documentation
5. Contact Supabase support for critical issues

---

**Last Updated**: November 2024
**Status**: Development configuration - secure before production deployment
