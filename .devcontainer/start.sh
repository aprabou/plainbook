# .devcontainer/start.sh
#!/bin/bash
export CLAUDE_API_KEY=$(curl -s https://storage.googleapis.com/research-share/claude_public_key.txt)
cp /workspaces/plainbook/examples/Soccer.plnb /tmp/Soccer.plnb
nohup plainbook /tmp/Soccer.plnb > /tmp/plainbook.log 2>&1 &
sleep 10
grep 'Authentication token' /tmp/plainbook.log
