DROP TABLE IF EXISTS postcode_data;

CREATE TABLE IF NOT EXISTS postcode_data (
                                             postcode VARCHAR(255) primary key NOT NULL,
    latitude DECIMAL,
    longitude DECIMAL
    );

INSERT INTO postcode_data (postcode, latitude, longitude)
VALUES ('NE1 4BJ', 54.975711, -1.619474),
       ('TR19 7AA', 50.066019, -5.713697),
       ('CV4 7AL', 52.385826, -1.564804),
       ('W1J 7NT', 51.503412, -0.15184);
