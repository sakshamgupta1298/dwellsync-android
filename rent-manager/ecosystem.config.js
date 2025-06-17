module.exports = {
  apps: [{
    name: "rent-manager-api",
    script: "python",
    args: "api.py",
    interpreter: "python3",
    watch: true,
    env: {
      "NODE_ENV": "production",
      "PORT": 5000
    },
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    log_file: "logs/combined.log",
    time: true
  }]
} 