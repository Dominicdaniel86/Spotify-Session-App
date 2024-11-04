#!/bin/sh

# wait-for-it.sh

HOST=$1
PORT=$2
shift 2
CMD="$@"

until nc -z "$HOST" "$PORT"; do
  echo "Waiting for $HOST:$PORT to be available..."
  sleep 1
done

echo "$HOST:$PORT is available. Running command: $CMD"
exec $CMD
