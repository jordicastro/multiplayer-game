#!/bin/bash
set -e
pushd front_end
echo "Type-checking the front end"
tsc --strict main.ts

echo "Uploading front end to the server"
mypy connect_to_server.py --strict --ignore-missing-imports
python3 connect_to_server.py
popd
# echo "Type-checking the back end"
# pushd back_end
# mypy main.py --strict --ignore-missing-imports
# echo "Running"
# python3 main.py
# popd
echo "Done"
