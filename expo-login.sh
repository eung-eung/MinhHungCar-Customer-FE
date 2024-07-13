#!/bin/sh
expect -c "
spawn expo login
expect \"? Email/Username:\"
send \"boyvip5231@gmail.com\r\"
expect \"? Password:\"
send \"@mingo!123\r\"
expect eof
"
