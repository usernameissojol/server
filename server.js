// const { execSync } = require('child_process');

const path = require('path');
const fs = require('fs');

/**
 * 🔥 CRITICAL ENV FIX (MUST BE FIRST)
 * npm / npx REQUIRE a writable HOME directory
 */
process.env.HOME = '/tmp';
process.env.NPM_CONFIG_CACHE = '/tmp/.npm';
process.env.NPM_CONFIG_PREFIX = '/tmp/.npm-global';

console.log('--- STARTING EHAAM RESCUE SCRIPT ---');

try {
    // Ensure temp npm directories exist
    fs.mkdirSync('/tmp/.npm', { recursive: true });
    fs.mkdirSync('/tmp/.npm-global', { recursive: true });

    // 1. Install dependencies if missing
    if (!fs.existsSync(path.join(__dirname, 'node_modules', 'express'))) {
        console.log('Express not found. Running npm install...');
        execSync('npm install --production --no-audit --no-fund', {
            stdio: 'inherit',
            cwd: __dirname,
        });
    }

    // 2. Prisma generate (SAFE now)
    console.log('Generating Prisma Client for Linux...');
    execSync('npx prisma generate', {
        stdio: 'inherit',
        cwd: __dirname,
        env: process.env,
    });

    console.log('--- SETUP COMPLETE. STARTING APP ---');

    // 3. Start app
    require('./dist/index.js');

} catch (error) {
    console.error('--- CRITICAL SETUP ERROR ---');
    console.error(error);
    process.exit(1);
}
