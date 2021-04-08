#!/usr/bin/env bash
set -e

echo
echo \$CONTRACT is $CONTRACT
echo \$OWNER is $OWNER
echo

#Step 7: Call makeAGuess function by the chosen guesser
near call $CONTRACT makeAGuess '{"gameId":2757160977, "guess": true}' --account_id gyanlakshmi.testnet

#Step 8: Call finishGame to get the winner
near call $CONTRACT finishGame '{"gameId":2757160977}' --account_id $OWNER

near call $CONTRACT getWinner '{"gameId":2757160977}' --account_id $OWNER
