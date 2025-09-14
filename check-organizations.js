/**
 * Quick Organization Check Script
 * Checks if organizations exist in the database
 */

const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const os = require('os')

async function checkOrganizations() {
  const dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'social-media-management', 'databases', 'app.db')
  
  console.log('🔍 Checking organizations in database...')
  console.log(`📁 Database path: ${dbPath}`)
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message)
      return
    }
    console.log('✅ Connected to database')
  })
  
  db.all('SELECT * FROM organizations ORDER BY name', [], (err, rows) => {
    if (err) {
      console.error('❌ Error querying organizations:', err.message)
      return
    }
    
    console.log(`\n📊 Found ${rows.length} organizations:`)
    console.log('=' .repeat(60))
    
    rows.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`)
      console.log(`   ID: ${org.id}`)
      console.log(`   Website: ${org.website}`)
      console.log(`   Description: ${org.description}`)
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
    
    const foundNames = rows.map(org => org.name)
    const missing = expectedOrganizations.filter(name => !foundNames.includes(name))
    
    console.log('📋 Verification Results:')
    console.log('=' .repeat(60))
    console.log(`✅ Expected: ${expectedOrganizations.length} organizations`)
    console.log(`📊 Found: ${rows.length} organizations`)
    
    if (missing.length > 0) {
      console.log(`❌ Missing: ${missing.join(', ')}`)
    } else {
      console.log('🎉 All 6 organizations found!')
    }
    
    if (rows.length === 6 && missing.length === 0) {
      console.log('\n✅ SUCCESS: All organizations are correctly created!')
      console.log('🌐 Go to: http://localhost:5173/')
      console.log('📝 Click "Select Org" tab to see all organizations')
    } else {
      console.log('\n⚠️ Some organizations are missing')
    }
    
    db.close()
  })
}

checkOrganizations().catch(console.error)
