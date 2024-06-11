DROP DATABASE IF EXISTS biztime_test;
CREATE DATABASE biztime_test;

\c biztime_test;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

INSERT INTO companies
VALUES
('comp1', 'test company 1', 'Creator of fake device 1'),
('comp2', 'test company 2', 'Ecommerce store');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
VALUES
('comp1', 100, false, null),
('comp1', 200, true, '2030-01-01'),
('comp2', 300, false, null);



