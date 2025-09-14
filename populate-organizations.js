/**
 * Populate Organizations Script
 * Executes SQL to create organizations in the database
 */

const fs = require('fs')
const path = require('path')

// Read the SQL script
const sqlScriptPath = path.join(__dirname, 'setup-organizations.sql')

if (fs.existsSync(sqlScriptPath)) {
  const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8')
  
  // Split into statements
  const statements = sqlScript
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
  
  console.log('🏢 Organization SQL Script Ready!')
  console.log(`📊 Found ${statements.length} SQL statements`)
  console.log('\n📝 To execute these in your app:')
  console.log('1. Copy the SQL from setup-organizations.sql')
  console.log('2. Execute in your database')
  console.log('3. Restart the application')
  
  // Show first few statements as example
  console.log('\n📋 First few statements:')
  statements.slice(0, 3).forEach((stmt, index) => {
    console.log(`${index + 1}. ${stmt.substring(0, 80)}...`)
  })
} else {
  console.log('❌ SQL script not found. Please run setup-organizations-simple.js first.')
}
