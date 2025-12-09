DROP TABLE IF EXISTS local_authorities;

DROP TABLE IF EXISTS care_provider_locations;

DROP TABLE IF EXISTS regions;

DROP TABLE IF EXISTS postcodes;

DROP TABLE IF EXISTS countries;

DROP TABLE IF EXISTS care_providers;


-- Start script

CREATE TABLE care_providers (
                                id uuid NOT NULL,
                                name character varying(100) NOT NULL,
                                code character varying(15) NOT NULL,
                                loaded_datetime timestamp with time zone NOT NULL,
                                CONSTRAINT "PK_care_providers" PRIMARY KEY (id)
);

CREATE TABLE countries (
                           id uuid NOT NULL,
                           name character varying(60) NOT NULL,
                           code character varying(15) NOT NULL,
                           loaded_datetime timestamp with time zone NOT NULL,
                           CONSTRAINT "PK_countries" PRIMARY KEY (id)
);

CREATE TABLE metric_groups (
                               id uuid NOT NULL,
                               name character varying(100) NOT NULL,
                               code character varying(15) NOT NULL,
                               loaded_datetime timestamp with time zone NOT NULL,
                               CONSTRAINT "PK_metric_groups" PRIMARY KEY (id)
);

CREATE TABLE regions (
                         id uuid NOT NULL,
                         name character varying(50) NOT NULL,
                         country_fk uuid NOT NULL,
                         code character varying(15) NOT NULL,
                         loaded_datetime timestamp with time zone NOT NULL,
                         CONSTRAINT "PK_regions" PRIMARY KEY (id),
                         CONSTRAINT "FK_regions_countries_country_fk" FOREIGN KEY (country_fk) REFERENCES countries (id) ON DELETE CASCADE
);

CREATE TABLE metrics (
                         id uuid NOT NULL,
                         name character varying(100) NOT NULL,
                         metric_group_fk uuid NOT NULL,
                         display_name character varying(255) NOT NULL,
                         numerator_description character varying(255) NOT NULL,
                         denominator_description character varying(255) NOT NULL,
                         data_source character varying(40) NOT NULL,
                         data_type character varying(50) NOT NULL,
                         frequency character varying(25) NOT NULL,
                         code character varying(15) NOT NULL,
                         loaded_datetime timestamp with time zone NOT NULL,
                         CONSTRAINT "PK_metrics" PRIMARY KEY (id),
                         CONSTRAINT "FK_metrics_metric_groups_metric_group_fk" FOREIGN KEY (metric_group_fk) REFERENCES metric_groups (id) ON DELETE CASCADE
);

CREATE TABLE local_authorities (
                                   id uuid NOT NULL,
                                   name character varying(50) NOT NULL,
                                   region_fk uuid NOT NULL,
                                   code character varying(15) NOT NULL,
                                   loaded_datetime timestamp with time zone NOT NULL,
                                   CONSTRAINT "PK_local_authorities" PRIMARY KEY (id),
                                   CONSTRAINT "FK_local_authorities_regions_region_fk" FOREIGN KEY (region_fk) REFERENCES regions (id) ON DELETE CASCADE
);

CREATE TABLE care_provider_locations (
                                         id uuid NOT NULL,
                                         name character varying(100) NOT NULL,
                                         care_provider_fk uuid NOT NULL,
                                         sanitised_postcode character varying(7) NOT NULL,
                                         address character varying(255) NOT NULL,
                                         nominated_individual character varying(255) NOT NULL,
                                         local_authority_fk uuid NOT NULL,
                                         code character varying(15) NOT NULL,
                                         loaded_datetime timestamp with time zone NOT NULL,
                                         CONSTRAINT "PK_care_provider_locations" PRIMARY KEY (id),
                                         CONSTRAINT "FK_care_provider_locations_care_providers_care_provider_fk" FOREIGN KEY (care_provider_fk) REFERENCES care_providers (id) ON DELETE CASCADE,
                                         CONSTRAINT "FK_care_provider_locations_local_authorities_local_authority_fk" FOREIGN KEY (local_authority_fk) REFERENCES local_authorities (id) ON DELETE CASCADE
);

CREATE TABLE postcodes (
                           id uuid NOT NULL,
                           display_postcode character varying(8) NOT NULL,
                           latitude numeric NOT NULL,
                           longitude numeric NOT NULL,
                           local_authority_fk uuid NOT NULL,
                           code character varying(15) NOT NULL,
                           loaded_datetime timestamp with time zone NOT NULL,
                           CONSTRAINT "PK_postcodes" PRIMARY KEY (id),
                           CONSTRAINT "FK_postcodes_local_authorities_local_authority_fk" FOREIGN KEY (local_authority_fk) REFERENCES local_authorities (id) ON DELETE CASCADE
);

CREATE INDEX "IX_care_provider_locations_care_provider_fk" ON care_provider_locations (care_provider_fk);

CREATE INDEX "IX_care_provider_locations_local_authority_fk" ON care_provider_locations (local_authority_fk);

CREATE INDEX "IX_local_authorities_region_fk" ON local_authorities (region_fk);

CREATE INDEX "IX_metrics_metric_group_fk" ON metrics (metric_group_fk);

CREATE INDEX "IX_postcodes_local_authority_fk" ON postcodes (local_authority_fk);

CREATE INDEX "IX_regions_country_fk" ON regions (country_fk);


-- insert test data

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
    country_id uuid = uuid_generate_v4();
    region_id uuid = uuid_generate_v4();
    la_id uuid = uuid_generate_v4();
BEGIN
    INSERT INTO countries (id, code, name, loaded_datetime)
    VALUES (country_id, 'E92000001','England', CURRENT_TIMESTAMP);

    INSERT INTO regions (id, code, name, country_fk, loaded_datetime)
    VALUES (region_id, 'E12000002', 'North West', country_id, CURRENT_TIMESTAMP);

    INSERT INTO local_authorities (id, code, name, region_fk, loaded_datetime)
    VALUES (la_id, 'E08000014', 'Liverpool', region_id, CURRENT_TIMESTAMP);

    INSERT INTO postcodes (id, code, display_postcode, latitude, longitude, local_authority_fk, loaded_datetime)
    VALUES (uuid_generate_v4(), 'KT220UF', 'KT22 0UF', 51.33954856349381, -0.349629386, la_id, CURRENT_TIMESTAMP),
           (uuid_generate_v4(), 'ME101QX', 'ME10 1QX', 51.32988801568501, 0.7260691453143282, la_id, CURRENT_TIMESTAMP),
           (uuid_generate_v4(), 'ME101QY', 'ME10 1QY', 51.32954649874547, 0.7283745919593453, la_id, CURRENT_TIMESTAMP),
           (uuid_generate_v4(), 'CV22TN', 'CV2 2TN', 52.43602168912626, -1.445481473, la_id, CURRENT_TIMESTAMP);
END $$;

