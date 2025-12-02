DROP TABLE IF EXISTS local_authorities;

DROP TABLE IF EXISTS care_provider_locations;

DROP TABLE IF EXISTS regions;

DROP TABLE IF EXISTS postcodes;

DROP TABLE IF EXISTS countries;

DROP TABLE IF EXISTS care_providers;


-- Start script


CREATE TABLE care_providers (
                                id character varying(15) NOT NULL,
                                name character varying(100),
                                loaded_datetime timestamp with time zone NOT NULL,
                                CONSTRAINT "PK_care_providers" PRIMARY KEY (id)
);

CREATE TABLE countries (
                           id character varying(15) NOT NULL,
                           name character varying(50),
                           loaded_datetime timestamp with time zone NOT NULL,
                           CONSTRAINT "PK_countries" PRIMARY KEY (id)
);

CREATE TABLE regions (
                         id character varying(15) NOT NULL,
                         name character varying(50),
                         country_fk character varying(15),
                         loaded_datetime timestamp with time zone NOT NULL,
                         CONSTRAINT "PK_regions" PRIMARY KEY (id),
                         CONSTRAINT "FK_regions_countries_country_fk" FOREIGN KEY (country_fk) REFERENCES countries (id)
);

CREATE TABLE local_authorities (
                                   id character varying(15) NOT NULL,
                                   name character varying(50),
                                   region_fk character varying(15),
                                   loaded_datetime timestamp with time zone NOT NULL,
                                   CONSTRAINT "PK_local_authorities" PRIMARY KEY (id),
                                   CONSTRAINT "FK_local_authorities_regions_region_fk" FOREIGN KEY (region_fk) REFERENCES regions (id)
);

CREATE TABLE postcodes (
                           sanitised_postcode character varying(7) NOT NULL,
                           display_postcode character varying(8) NOT NULL,
                           latitude numeric,
                           longitude numeric,
                           local_authority_fk character varying(15),
                           loaded_datetime timestamp with time zone NOT NULL,
                           CONSTRAINT "PK_postcodes" PRIMARY KEY (sanitised_postcode),
                           CONSTRAINT "FK_postcodes_local_authorities_local_authority_fk" FOREIGN KEY (local_authority_fk) REFERENCES local_authorities (id)
);

CREATE TABLE care_provider_locations (
                                         id character varying(15) NOT NULL,
                                         name character varying(100),
                                         care_provider_fk character varying(15),
                                         sanitised_postcode_fk character varying(7),
                                         address character varying(255),
                                         nominated_individual character varying(255),
                                         local_authority_fk character varying(15),
                                         loaded_datetime timestamp with time zone NOT NULL,
                                         CONSTRAINT "PK_care_provider_locations" PRIMARY KEY (id),
                                         CONSTRAINT "FK_care_provider_locations_care_providers_care_provider_fk" FOREIGN KEY (care_provider_fk) REFERENCES care_providers (id),
                                         CONSTRAINT "FK_care_provider_locations_local_authorities_local_authority_fk" FOREIGN KEY (local_authority_fk) REFERENCES local_authorities (id),
                                         CONSTRAINT "FK_care_provider_locations_postcodes_sanitised_postcode_fk" FOREIGN KEY (sanitised_postcode_fk) REFERENCES postcodes (sanitised_postcode)
);

CREATE INDEX "IX_care_provider_locations_care_provider_fk" ON care_provider_locations (care_provider_fk);

CREATE INDEX "IX_care_provider_locations_local_authority_fk" ON care_provider_locations (local_authority_fk);

CREATE INDEX "IX_care_provider_locations_sanitised_postcode_fk" ON care_provider_locations (sanitised_postcode_fk);

CREATE INDEX "IX_local_authorities_region_fk" ON local_authorities (region_fk);

CREATE INDEX "IX_postcodes_local_authority_fk" ON postcodes (local_authority_fk);

CREATE INDEX "IX_regions_country_fk" ON regions (country_fk);



-- insert test data


INSERT INTO countries (id, name, loaded_datetime)
VALUES ('E92000001','England', CURRENT_TIMESTAMP);
    
INSERT INTO regions (id, name, country_fk, loaded_datetime)
VALUES ('E12000002', 'North West', 'E92000001', CURRENT_TIMESTAMP);

INSERT INTO local_authorities (id, name, region_fk, loaded_datetime)
VALUES ('E08000014', 'Liverpool', 'E12000002', CURRENT_TIMESTAMP);
            

INSERT INTO postcodes (sanitised_postcode, display_postcode, latitude, longitude, local_authority_fk, loaded_datetime)
VALUES ('KT220UF', 'KT22 0UF', 51.33954856349381, -0.349629386, 'E08000014', CURRENT_TIMESTAMP),
       ('ME101QX', 'ME10 1QX', 51.32988801568501, 0.7260691453143282, 'E08000014', CURRENT_TIMESTAMP),
       ('ME101QY', 'ME10 1QY', 51.32954649874547, 0.7283745919593453, 'E08000014', CURRENT_TIMESTAMP),
       ('CV22TN', 'CV2 2TN', 52.43602168912626, -1.445481473, 'E08000014', CURRENT_TIMESTAMP);

