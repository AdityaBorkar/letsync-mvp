# Points to Remember

- Monitor clock synchronization across nodes:
    SELECT * FROM crdb_internal.node_metrics
    WHERE name = 'clock-offset';
