# 🔐 Security Quick Start Guide

## ⚠️ Critical Action Required

You have a security warning: **"Leaked Password Protection Disabled"**

## 🚀 Quick Fix (2 minutes)

### For Development (Recommended)

**Step 1**: Create test users first
```bash
npm run create-test-users
```

**Step 2**: Enable leaked password protection
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Policies** (or **Settings**)
4. Find **"Leaked Password Protection"**
5. Toggle it **ON**
6. Save

✅ Done! Your users are created and security is enabled.

### For Production (Before Launch)

**Step 1**: Enable leaked password protection FIRST

**Step 2**: Use strong passwords in `test_users.csv`:
```csv
admin1@collabspace.edu,SecureAdmin2024!Pass,admin,Sarah,Anderson,,
teacher1@collabspace.edu,TeacherSecure2024!,teacher,Emily,Johnson,,
student1@collabspace.edu,Student!Secure2024,student,Alex,Thompson,CS2021001,A
```

**Step 3**: Run bulk creation script
```bash
npm run create-test-users
```

## 📋 Pre-Production Security Checklist

Before deploying to production:

- [ ] ✅ Enable leaked password protection
- [ ] ✅ Delete all test users
- [ ] ✅ Change default admin passwords
- [ ] ✅ Enable MFA for admin accounts
- [ ] ✅ Review RLS policies
- [ ] ✅ Verify service role key is not exposed
- [ ] ✅ Set strong password requirements (8+ chars)
- [ ] ✅ Configure rate limiting
- [ ] ✅ Customize email templates

## 📚 Full Documentation

- **Complete Security Guide**: `database/SUPABASE_SECURITY_CONFIG.md`
- **Test Users Guide**: `database/TEST_USERS_README.md`
- **User Deletion Fix**: `database/USER_DELETION_README.md`

## 🆘 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Security Docs](https://supabase.com/docs/guides/platform/going-into-prod)
- [HaveIBeenPwned](https://haveibeenpwned.com/)

---

**Bottom Line**: For now, create your test users then enable leaked password protection. Before production, enable it first and use strong passwords.
