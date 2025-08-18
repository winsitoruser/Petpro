#!/bin/bash
docker exec -it petpro-kafka bash -c "
  for topic in \
    admin_login \
    admin_logout \
    admin_profile \
    create_admin \
    get_admin_users \
    get_admin_user \
    update_admin_user \
    deactivate_admin_user \
    activate_admin_user \
    get_dashboard_stats \
    get_recent_activity \
    get_system_health
  do
    kafka-topics.sh --create \
      --if-not-exists \
      --topic \$topic \
      --bootstrap-server localhost:9092 \
      --replication-factor 1 \
      --partitions 1
  done
"
