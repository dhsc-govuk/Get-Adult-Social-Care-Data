DROP TABLE IF EXISTS postcodes;

CREATE TABLE care_providers (
                                id text NOT NULL,
                                name text,
                                loaded_datetime timestamp with time zone NOT NULL,
                                CONSTRAINT "PK_care_providers" PRIMARY KEY (id)
);

CREATE TABLE postcodes (
                           sanitised_postcode character varying(7) NOT NULL,
                           display_postcode character varying(8) NOT NULL,
                           latitude numeric,
                           longitude numeric,
                           la_code character varying(9),
                           CONSTRAINT "PK_postcodes" PRIMARY KEY (sanitised_postcode)
);

INSERT INTO postcodes (sanitised_postcode, display_postcode, latitude, longitude, la_code)
VALUES ('KT220UF', 'KT22 0UF', 51.33954856349381, -0.349629386, 'E07000207'),
       ('ME101QX', 'ME10 1QX', 51.32988801568501, 0.7260691453143282, 'E07000113'),
       ('ME101QY', 'ME10 1QY', 51.32954649874547, 0.7283745919593453, 'E07000113'),
       ('CV22TN', 'CV2 2TN', 52.43602168912626, -1.445481473, 'E08000026');

