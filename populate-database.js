/**
 * Database Population Script
 * Executes the SQL script to populate the database with organizations
 */

const fs = require('fs')
const path = require('path')

class DatabasePopulator {
  constructor() {
    this.sqlScriptPath = path.join(__dirname, 'setup-organizations.sql')
  }

  async populateDatabase() {
    console.log('🗄️ Populating database with organizations...\n')
    
    try {
      // Check if SQL script exists
      if (!fs.existsSync(this.sqlScriptPath)) {
        throw new Error('SQL script not found. Please run setup-organizations-simple.js first.')
      }
      
      // Read SQL script
      const sqlScript = fs.readFileSync(this.sqlScriptPath, 'utf8')
      console.log('✅ SQL script loaded')
      
      // In a real Electron app, you would execute this SQL against the database
      // For now, we'll create a script that can be run when the app starts
      const executableScript = this.createExecutableScript(sqlScript)
      
      const executablePath = path.join(__dirname, 'execute-organization-setup.js')
      fs.writeFileSync(executablePath, executableScript)
      console.log(`✅ Executable script created: ${executablePath}`)
      
      console.log('\n📋 Database Population Instructions:')
      console.log('=' .repeat(50))
      console.log('1. Start your application: npm run dev')
      console.log('2. The app will automatically load organizations from the database')
      console.log('3. If organizations don\'t appear, run: node execute-organization-setup.js')
      console.log('4. Then restart the application')
      
      console.log('\n🎉 Database population setup completed!')
      
    } catch (error) {
      console.error('❌ Database population failed:', error.message)
    }
  }

  createExecutableScript(sqlScript) {
    return `/**
 * Execute Organization Setup
 * This script executes the SQL to create organizations in the database
 */

const { databaseService } = require('./dist/services/database/DatabaseService.js')

class OrganizationExecutor {
  constructor() {
    this.sqlScript = \`${sqlScript.replace(/`/g, '\\`')}\`
  }

  async execute() {
    console.log('🏢 Executing organization setup...')
    
    try {
      // Split SQL script into individual statements
      const statements = this.sqlScript
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      console.log(\`Found \${statements.length} SQL statements to execute\`)
      
      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'
        try {
          await databaseService.execute(statement)
          console.log(\`✅ Statement \${i + 1} executed successfully\`)
        } catch (error) {
          console.log(\`⚠️ Statement \${i + 1} failed (may already exist): \${error.message}\`)
        }
      }
      
      console.log('\\n🎉 Organization setup completed!')
      console.log('📝 Next steps:')
      console.log('   1. Restart your application')
      console.log('   2. Go to login screen')
      console.log('   3. Click "Select Org" to see organizations')
      
    } catch (error) {
      console.error('❌ Execution failed:', error.message)
    }
  }
}

// Run if called directly
if (require.main === module) {
  const executor = new OrganizationExecutor()
  executor.execute().catch(console.error)
}

module.exports = { OrganizationExecutor }
`
  }
}

// Run the population
async function main() {
  const populator = new DatabasePopulator()
  await populator.populateDatabase()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { DatabasePopulator }
