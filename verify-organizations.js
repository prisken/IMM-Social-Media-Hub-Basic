/**
 * Verify Organizations Script
 * Checks if all 6 organizations are created correctly
 */

const { databaseService } = require('./dist/services/database/DatabaseService.js')

async function verifyOrganizations() {
  console.log('🔍 Verifying organizations...\n')
  
  try {
    const organizations = await databaseService.getAllOrganizations()
    
    console.log(`📊 Found ${organizations.length} organizations:`)
    console.log('=' .repeat(50))
    
    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`)
      console.log(`   ID: ${org.id}`)
      console.log(`   Website: ${org.website}`)
      console.log(`   Settings: ${org.settings ? 'Present' : 'Missing'}`)
      if (org.settings && org.settings.branding) {
        console.log(`   Primary Color: ${org.settings.branding.primaryColor}`)
      }
      console.log('')
    })
    
    const expectedOrganizations = [
      'Karma Cookie',
      'Persona Centric', 
      'IMM Limited',
      'Roleplay',
      'HK Foodies',
      '1/2 Drinks'
    ]
    
    const foundNames = organizations.map(org => org.name)
    const missing = expectedOrganizations.filter(name => !foundNames.includes(name))
    const extra = foundNames.filter(name => !expectedOrganizations.includes(name))
    
    console.log('📋 Verification Results:')
    console.log('=' .repeat(50))
    console.log(`✅ Expected: ${expectedOrganizations.length} organizations`)
    console.log(`📊 Found: ${organizations.length} organizations`)
    
    if (missing.length > 0) {
      console.log(`❌ Missing: ${missing.join(', ')}`)
    } else {
      console.log('✅ All expected organizations found')
    }
    
    if (extra.length > 0) {
      console.log(`⚠️ Extra: ${extra.join(', ')}`)
    }
    
    if (organizations.length === 6 && missing.length === 0) {
      console.log('\n🎉 All 6 organizations are correctly created!')
      console.log('📝 You can now:')
      console.log('   1. Go to http://localhost:5175/')
      console.log('   2. Click "Select Org" tab')
      console.log('   3. Choose from the 6 organizations')
    } else {
      console.log('\n⚠️ Some organizations are missing or incorrect')
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

// Run verification
if (require.main === module) {
  verifyOrganizations().catch(console.error)
}

module.exports = { verifyOrganizations }
