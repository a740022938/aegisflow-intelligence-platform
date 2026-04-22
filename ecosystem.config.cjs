module.exports = {
  apps: [
    {
      name: 'agi-factory-api',
      script: 'npx',
      args: 'tsx src/index.ts',
      cwd: process.env.AGI_API_CWD || './apps/local-api',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        OPENCLAW_BASE_URL: process.env.OPENCLAW_BASE_URL || 'http://127.0.0.1:18789',
        OPENCLAW_HEARTBEAT_TOKEN: process.env.OPENCLAW_HEARTBEAT_TOKEN || '',
        OPENCLAW_ADMIN_TOKEN: process.env.OPENCLAW_ADMIN_TOKEN || '',
      },
      watch: ['src'],
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'dist'],
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 10,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: process.env.AGI_API_ERROR_LOG || './logs/api-error.log',
      out_file: process.env.AGI_API_OUT_LOG || './logs/api-out.log',
    },
  ],
};
