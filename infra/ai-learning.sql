-- Additive, rerunnable migration. Existing results and permissions are unchanged.
IF OBJECT_ID(N'dbo.AiLearning', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.AiLearning (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AiLearning PRIMARY KEY,
    UserId NVARCHAR(255) NOT NULL,
    Title NVARCHAR(120) NOT NULL,
    Status VARCHAR(12) NOT NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_AiLearning_CreatedAt DEFAULT SYSUTCDATETIME(),
    RequestJson NVARCHAR(MAX) NULL,
    ContentJson NVARCHAR(MAX) NULL,
    ErrorCode VARCHAR(30) NULL,
    LeaseToken UNIQUEIDENTIFIER NULL,
    LeaseUntil DATETIME2(3) NULL,
    Attempts INT NOT NULL CONSTRAINT DF_AiLearning_Attempts DEFAULT 0,
    CONSTRAINT CK_AiLearning_Status CHECK (Status IN ('queued', 'processing', 'ready', 'failed')),
    CONSTRAINT CK_AiLearning_Request CHECK (RequestJson IS NULL OR ISJSON(RequestJson) = 1),
    CONSTRAINT CK_AiLearning_Content CHECK (ContentJson IS NULL OR (ISJSON(ContentJson) = 1 AND DATALENGTH(ContentJson) <= 96000)),
    CONSTRAINT CK_AiLearning_Ready CHECK (Status <> 'ready' OR ContentJson IS NOT NULL)
  );
  CREATE INDEX IX_AiLearning_UserDate ON dbo.AiLearning (UserId, CreatedAt DESC, Id DESC);
  CREATE INDEX IX_AiLearning_Queue ON dbo.AiLearning (Status, CreatedAt) INCLUDE (LeaseUntil, Attempts);
END;
