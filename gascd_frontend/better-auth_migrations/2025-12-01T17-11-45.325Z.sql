alter table "user" add "role" varchar(8000);

alter table "user" add "banned" smallint;

alter table "user" add "banReason" varchar(8000);

alter table "user" add "banExpires" datetime2(3);

alter table "session" add "impersonatedBy" varchar(8000);