#!/bin/bash
cd "d:/Documents/projects/HyperHDR"
export GIT_PAGER=""
export PAGER=""
git add -A
git commit -m "Complete WS2814f UI interface fixes with permanent SwapWB solution"
git push origin master
echo "Push completed!"
