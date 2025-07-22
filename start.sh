set -e

cd /frontend && PORT=3000 npm start &

cd /backend && node app.js &

nginx -g "daemon off;"