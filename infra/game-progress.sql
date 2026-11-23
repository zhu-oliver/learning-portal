-- Additive, rerunnable migration; quiz history and AI learning remain unchanged.
IF OBJECT_ID(N'dbo.GameProgress', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.GameProgress (
    UserId NVARCHAR(255) NOT NULL,
    Game VARCHAR(40) NOT NULL,
    ProgressJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_GameProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_GameProgress PRIMARY KEY (UserId, Game),
    CONSTRAINT CK_GameProgress_Json CHECK (ISJSON(ProgressJson)=1 AND DATALENGTH(ProgressJson)<=128000)
  );
END;
