# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "azure-identity>=1.25.1",
#     "psycopg[binary]>=3.3.2",
# ]
# ///


import os
import sys
import psycopg
from psycopg import sql
from contextlib import contextmanager, ExitStack
from dataclasses import dataclass, field
from azure.identity import DefaultAzureCredential


@dataclass
class Config:
    host: str = field(
        default_factory=lambda: os.getenv(
            "PGHOST", "dapalpha-pg-dev.postgres.database.azure.com"
        )
    )
    primary_dbname: str = field(
        default_factory=lambda: os.getenv("PGPRIMARYDB", "postgres")
    )
    data_db: str = field(default_factory=lambda: os.getenv("PGDATADB", "gascd_data"))
    user: str = field(
        default_factory=lambda: os.getenv("PGUSER", "GASCD - Postgres Admins - DEV")
    )
    print_tables: bool = field(
        default_factory=lambda: Config.get_env_bool("PRINT_TABLES")
    )
    print_sequences: bool = field(
        default_factory=lambda: Config.get_env_bool("PRINT_SEQUENCES")
    )
    environment: str = field(default_factory=lambda: os.getenv("ENVIRONMENT", "dev"))

    @staticmethod
    def get_env_bool(name: str, default: str = "true") -> bool:
        return os.getenv(name, default).lower() in ("true", "1", "t", "y", "yes")

    def __post_init__(self):
        if not self.environment:
            raise ValueError("environment must be a non-empty string")
        if len(self.environment) > 4:
            raise ValueError("environment must be no more than 4 characters long")


@dataclass
class TableInfo:
    table_name: str


@dataclass
class SequenceInfo:
    sequence_name: str
    table_name: str | None = None
    column_name: str | None = None


class PostgresManager:
    AZURE_POSTGRES_SCOPE = "https://ossrdbms-aad.database.windows.net/.default"

    def __init__(self, config: Config, credential: DefaultAzureCredential):
        self.config = config
        self.credential = credential
        self._primary_conn: psycopg.Connection | None = None
        self._data_conn: psycopg.Connection | None = None
        self._exit_stack: ExitStack | None = None

    def __enter__(self):
        self._exit_stack = ExitStack()
        try:
            token = self.get_postgresql_token()
            conn_params = {
                "host": self.config.host,
                "user": self.config.user,
                "password": token,
                "sslmode": "require",
            }
            self._primary_conn = self._exit_stack.enter_context(
                psycopg.connect(
                    dbname=self.config.primary_dbname, autocommit=True, **conn_params
                )
            )
            self._data_conn = self._exit_stack.enter_context(
                psycopg.connect(
                    dbname=self.config.data_db, autocommit=True, **conn_params
                )
            )
            return self
        except Exception:
            self._exit_stack.close()
            self._primary_conn = None
            self._data_conn = None
            self._exit_stack = None
            raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._exit_stack:
            self._exit_stack.close()
            self._exit_stack = None
        self._primary_conn = None
        self._data_conn = None

    @property
    def primary_conn(self) -> psycopg.Connection:
        if self._primary_conn is None:
            raise RuntimeError(
                "Primary connection not established. Use get_db_connections() context manager."
            )
        return self._primary_conn

    @property
    def data_conn(self) -> psycopg.Connection:
        if self._data_conn is None:
            raise RuntimeError(
                "Data connection not established. Use get_db_connections() context manager."
            )
        return self._data_conn

    def get_reader_group_name(self) -> str:
        return f"GASCD - Postgres Readers - {self.config.environment.upper()}"

    def get_writer_group_name(self) -> str:
        return f"GASCD - Postgres Writers - {self.config.environment.upper()}"

    def list_tables(self) -> list[TableInfo]:
        with self.data_conn.cursor() as cur:
            # Query to list all tables in the public schema
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                AND table_name != 'spatial_ref_sys'
                AND table_name != '__EFMigrationsHistory'
                ORDER BY table_name;
            """)
            return [TableInfo(table_name=row[0]) for row in cur.fetchall()]

    def list_sequences(self) -> list[SequenceInfo]:
        with self.data_conn.cursor() as cur:
            # Query to list sequences and their associated tables/columns
            # This uses pg_depend to find the relationship between the sequence and the table column
            cur.execute("""
                SELECT 
                    s.relname AS sequence_name,
                    t.relname AS table_name,
                    a.attname AS column_name
                FROM pg_class s
                JOIN pg_namespace n ON n.oid = s.relnamespace
                LEFT JOIN pg_depend d ON d.objid = s.oid AND d.deptype IN ('a', 'i')
                LEFT JOIN pg_class t ON t.oid = d.refobjid
                LEFT JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
                WHERE s.relkind = 'S'
                AND n.nspname = 'public'
                ORDER BY s.relname;
            """)
            return [
                SequenceInfo(
                    sequence_name=row[0], table_name=row[1], column_name=row[2]
                )
                for row in cur.fetchall()
            ]

    def _execute_sql(
        self,
        conn: psycopg.Connection,
        query_template: sql.SQL,
        identifiers: list,
        ignore_errors: bool = False,
    ) -> None:
        composed_query = query_template.format(*identifiers)
        with conn.cursor() as cur:
            print(composed_query.as_string(cur))
            try:
                cur.execute(composed_query)
            except psycopg.Error:
                if not ignore_errors:
                    raise

    def run_sql(
        self,
        query_template: sql.SQL,
        identifiers: list,
        ignore_errors: bool = False,
    ) -> None:
        self._execute_sql(self.data_conn, query_template, identifiers, ignore_errors)

    def run_primary_sql(
        self,
        query_template: sql.SQL,
        identifiers: list,
        ignore_errors: bool = False,
    ) -> None:
        self._execute_sql(self.primary_conn, query_template, identifiers, ignore_errors)

    def run_queries(
        self,
        query_templates: list[sql.SQL],
        identifiers: list,
    ) -> None:
        for template in query_templates:
            self.run_sql(template, identifiers)

    def get_postgresql_token(self) -> str:
        return self.credential.get_token(self.AZURE_POSTGRES_SCOPE).token

    @contextmanager
    def get_db_connections(self):
        with self:
            yield

    def run_all(self) -> None:
        """Runs the complete set of database access and configuration tasks."""
        with self:
            print(
                f"Successfully connected to {self.config.primary_dbname} and {self.config.data_db}."
            )
            self.run_access_test()
            self.configure_gascd_group_access()
            self.configure_group_table_access()
            self.configure_gascd_data_ownership()

    def print_database_info(self) -> None:
        if self.config.print_tables:
            print(f"\nListing tables in {self.config.data_db}...")
            tables = self.list_tables()
            if tables:
                print(f"Tables in '{self.config.data_db}':")
                for table in tables:
                    print(f" - {table.table_name}")
            else:
                print(
                    f"No tables found in the public schema of '{self.config.data_db}'."
                )

        if self.config.print_sequences:
            print(
                f"\nListing sequences and their associated tables in {self.config.data_db}..."
            )
            sequences = self.list_sequences()
            if sequences:
                print(f"Sequences in '{self.config.data_db}':")
                for seq in sequences:
                    assoc = (
                        f" (associated with {seq.table_name}.{seq.column_name})"
                        if seq.table_name
                        else " (no association found)"
                    )
                    print(f" - {seq.sequence_name}{assoc}")
            else:
                print(
                    f"No sequences found in the public schema of '{self.config.data_db}'."
                )

    def run_access_test(self) -> None:
        print(f"Running access test on {self.config.host}...")
        with self.primary_conn.transaction(), self.data_conn.transaction():
            with self.primary_conn.cursor() as cur:
                cur.execute("SELECT 1")
                result = cur.fetchone()
                print(f"Execution result in {self.config.primary_dbname}: {result}")

            with self.data_conn.cursor() as cur:
                cur.execute("SELECT 1")
                result = cur.fetchone()
                print(f"Execution result in {self.config.data_db}: {result}")

            self.print_database_info()

    def configure_gascd_group_access(self) -> None:
        print(f"Configuring GASCD group access on {self.config.host}...")
        reader = self.get_reader_group_name()
        writer = self.get_writer_group_name()
        self.run_primary_sql(
            sql.SQL("SELECT * FROM pgaadauth_create_principal({}, false, false)"),
            [sql.Literal(reader)],
            ignore_errors=True,
        )
        self.run_primary_sql(
            sql.SQL("SELECT * FROM pgaadauth_create_principal({}, false, false)"),
            [sql.Literal(writer)],
            ignore_errors=True,
        )
        print("Group access configuration completed")

    def configure_group_table_access(self) -> None:
        print(f"Configuring group table access on {self.config.host}...")
        reader = self.get_reader_group_name()
        writer = self.get_writer_group_name()

        with self.data_conn.transaction():
            self.run_queries(
                [
                    sql.SQL(
                        "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO {}"
                    ),
                    sql.SQL("GRANT SELECT ON ALL TABLES IN SCHEMA public TO {}"),
                    sql.SQL(
                        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO {}"
                    ),
                    sql.SQL(
                        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO {}"
                    ),
                ],
                [sql.Identifier(reader)],
            )
            self.run_queries(
                [
                    sql.SQL(
                        "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO {}"
                    ),
                    sql.SQL("GRANT SELECT ON ALL TABLES IN SCHEMA public TO {}"),
                    sql.SQL(
                        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO {}"
                    ),
                    sql.SQL("GRANT TRUNCATE ON ALL TABLES IN SCHEMA public TO {}"),
                    sql.SQL(
                        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT TRUNCATE ON TABLES TO {}"
                    ),
                    sql.SQL(
                        "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {}"
                    ),
                    sql.SQL(
                        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO {}"
                    ),
                    sql.SQL(
                        "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {}"
                    ),
                    sql.SQL(
                        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO {}"
                    ),
                    sql.SQL("GRANT CREATE ON SCHEMA public TO {}")
                ],
                [sql.Identifier(writer)],
            )
            print("Group table access configuration completed")

    def configure_gascd_data_ownership(self) -> None:
        print(f"Configuring GASCD data ownership on {self.config.host}...")
        writer = self.get_writer_group_name()
        tables = self.list_tables()
        sequences = self.list_sequences()

        with self.data_conn.transaction():
            for table in tables:
                self.run_sql(
                    sql.SQL("ALTER TABLE {} OWNER TO {}"),
                    [sql.Identifier(table.table_name), sql.Identifier(writer)],
                )
            for seq in sequences:
                self.run_sql(
                    sql.SQL("ALTER SEQUENCE {} OWNER TO {}"),
                    [sql.Identifier(seq.sequence_name), sql.Identifier(writer)],
                )
            print("Data ownership configuration completed")


def main() -> None:
    # Configuration using dataclass, pulling from env vars if available
    config = Config()
    credential = DefaultAzureCredential()
    pg_manager = PostgresManager(config, credential)
    try:
        pg_manager.run_all()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
