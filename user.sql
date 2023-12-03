CREATE USER 'pools'@'localhost' IDENTIFIED BY 'cosbypools';

-- Grant read and write privileges to all tables in a specific database
GRANT SELECT, INSERT, UPDATE, DELETE ON pools.* TO 'pools'@'localhost';

-- Revoke the permission to create tables
REVOKE CREATE ON pools.* FROM 'pools'@'localhost';