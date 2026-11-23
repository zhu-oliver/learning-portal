-- Run once in the target database as the Microsoft Entra administrator.
IF OBJECT_ID(N'dbo.TestResults', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.TestResults (
    UserId NVARCHAR(255) NOT NULL,
    AttemptId UNIQUEIDENTIFIER NOT NULL,
    CompletedAt DATETIME2(3) NOT NULL
      CONSTRAINT DF_TestResults_CompletedAt DEFAULT SYSUTCDATETIME(),
    ResultJson NVARCHAR(MAX) NOT NULL,
    CONSTRAINT PK_TestResults PRIMARY KEY (UserId, AttemptId),
    CONSTRAINT CK_TestResults_Json CHECK (ISJSON(ResultJson) = 1)
  );
  CREATE INDEX IX_TestResults_UserDate
    ON dbo.TestResults (UserId, CompletedAt DESC, AttemptId DESC);
END;

-- Replace the placeholders, then execute these separately.
-- The App Service managed identity only needs SELECT and INSERT.
-- CREATE USER [<app-service-name>] FROM EXTERNAL PROVIDER;
-- GRANT SELECT, INSERT ON OBJECT::dbo.TestResults TO [<app-service-name>];
-- For passwordless local testing, grant the signed-in developer:
-- CREATE USER [<developer-entra-email>] FROM EXTERNAL PROVIDER;
-- GRANT SELECT, INSERT ON OBJECT::dbo.TestResults TO [<developer-entra-email>];
