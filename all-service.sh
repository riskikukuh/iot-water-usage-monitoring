#!/bin/bash

pm2 start --name "dummy-water-usage-service" npm -- run water-usage:debug
pm2 start --name "histories-service" npm -- run history-scheduller
pm2 start --name "bill-service" npm -- run bill-service:debug
