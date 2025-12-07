-- Initialize local MySQL databases for ISG microservices
-- Connection: 127.0.0.1:3306, user: root, password: secgem

-- Charset / collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Users
CREATE DATABASE IF NOT EXISTS users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Trainings
CREATE DATABASE IF NOT EXISTS trainings_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE trainings_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Risks
CREATE DATABASE IF NOT EXISTS risks_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE risks_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Incidents
CREATE DATABASE IF NOT EXISTS incidents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE incidents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Documents
CREATE DATABASE IF NOT EXISTS documents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE documents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional: verify
SHOW DATABASES LIKE 'users_db';
SHOW DATABASES LIKE 'trainings_db';
SHOW DATABASES LIKE 'risks_db';
SHOW DATABASES LIKE 'incidents_db';
SHOW DATABASES LIKE 'documents_db';
