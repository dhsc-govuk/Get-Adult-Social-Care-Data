DROP TABLE IF EXISTS postcode_data;

CREATE TABLE IF NOT EXISTS postcode_data (
    sanitised_postcode VARCHAR(255) primary key NOT NULL,
    display_postcode VARCHAR(255),
    latitude DECIMAL,
    longitude DECIMAL,
    la_code VARCHAR(255)
);


INSERT INTO postcode_data (sanitised_postcode, display_postcode, latitude, longitude, la_code)
VALUES ('KT220UF', 'KT22 0UF', 51.33954856349381, -0.349629386, 'E07000207'),
       ('ME101QX', 'ME10 1QX', 51.32988801568501, 0.7260691453143282, 'E07000113'),
       ('ME101QY', 'ME10 1QY', 51.32954649874547, 0.7283745919593453, 'E07000113'),
       ('CV22TN', 'CV2 2TN', 52.43602168912626, -1.445481473, 'E08000026');

