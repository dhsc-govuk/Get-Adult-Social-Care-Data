-- $(DB_NAME) is a placeholder that gets replaced by sqlcmd before execution
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$(DB_NAME)')
BEGIN
    CREATE DATABASE [$(DB_NAME)];
END
GO