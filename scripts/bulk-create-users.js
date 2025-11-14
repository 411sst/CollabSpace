#!/usr/bin/env node

/**
 * Bulk User Creation Script for CollabSpace
 *
 * This script reads test_users.csv and creates users in Supabase Auth
 * using the Admin API (requires service role key).
 *
 * Usage:
 *   node scripts/bulk-create-users.js
 *
 * Prerequisites:
 *   1. Set SUPABASE_SERVICE_ROLE_KEY in .env file
 *   2. Ensure database/test_users.csv exists
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
dotenv.config({ path: join(rootDir, '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing environment variables')
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY in your .env file')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.trim().split('\n')
    const headers = lines[0].split(',')

    const users = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const user = {}

      headers.forEach((header, index) => {
        const value = values[index]?.trim()
        user[header.trim()] = value || null
      })

      users.push(user)
    }

    return users
  } catch (error) {
    console.error('❌ Error reading CSV file:', error.message)
    process.exit(1)
  }
}

/**
 * Create a single user
 */
async function createUser(userData) {
  const { email, password, role, first_name, last_name, student_id, section } = userData

  try {
    // Create auth user with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        firstName: first_name,
        lastName: last_name,
        role,
        ...(student_id && { studentId: student_id }),
        ...(section && { section })
      }
    })

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        return { success: false, email, error: 'User already exists', skipped: true }
      }
      return { success: false, email, error: authError.message }
    }

    // Wait a bit for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.warn(`⚠️  Warning: User ${email} created in auth but profile check failed:`, profileError.message)
    }

    return {
      success: true,
      email,
      userId: authData.user.id,
      profileCreated: !!profile
    }

  } catch (error) {
    return { success: false, email, error: error.message }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 CollabSpace Bulk User Creation')
  console.log('=' .repeat(50))

  // Read CSV file
  const csvPath = join(rootDir, 'database', 'test_users.csv')
  console.log(`📖 Reading users from: ${csvPath}`)

  const users = parseCSV(csvPath)
  console.log(`✅ Found ${users.length} users to create\n`)

  // Stats
  const stats = {
    total: users.length,
    created: 0,
    skipped: 0,
    failed: 0
  }

  // Create users
  console.log('Creating users...\n')

  for (const user of users) {
    const result = await createUser(user)

    if (result.success) {
      stats.created++
      console.log(`✅ Created: ${result.email} (${user.role})`)
      if (!result.profileCreated) {
        console.log(`   ⚠️  Profile verification failed`)
      }
    } else if (result.skipped) {
      stats.skipped++
      console.log(`⏭️  Skipped: ${result.email} - ${result.error}`)
    } else {
      stats.failed++
      console.log(`❌ Failed: ${result.email} - ${result.error}`)
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`   Total:   ${stats.total}`)
  console.log(`   Created: ${stats.created} ✅`)
  console.log(`   Skipped: ${stats.skipped} ⏭️`)
  console.log(`   Failed:  ${stats.failed} ❌`)
  console.log('='.repeat(50))

  if (stats.failed > 0) {
    console.log('\n⚠️  Some users failed to create. Check errors above.')
    process.exit(1)
  } else {
    console.log('\n🎉 All users created successfully!')
    process.exit(0)
  }
}

// Run
main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
