-- DEMO DATA: safe to run more than once; uses clearly fictional data.
USE autocare;
INSERT IGNORE INTO users (name,email,password_hash,phone,role,avatar_initials,status) VALUES
('Demo Customer 01','demo.customer01@example.test','customer-login-uses-plate-and-phone','9000000001','customer','DC','active'),
('Demo Customer 02','demo.customer02@example.test','customer-login-uses-plate-and-phone','9000000002','customer','DC','active'),
('Demo Customer 03','demo.customer03@example.test','customer-login-uses-plate-and-phone','9000000003','customer','DC','active'),
('Demo Customer 04','demo.customer04@example.test','customer-login-uses-plate-and-phone','9000000004','customer','DC','active'),
('Demo Customer 05','demo.customer05@example.test','customer-login-uses-plate-and-phone','9000000005','customer','DC','active'),
('Demo Customer 06','demo.customer06@example.test','customer-login-uses-plate-and-phone','9000000006','customer','DC','active'),
('Demo Customer 07','demo.customer07@example.test','customer-login-uses-plate-and-phone','9000000007','customer','DC','active'),
('Demo Customer 08','demo.customer08@example.test','customer-login-uses-plate-and-phone','9000000008','customer','DC','active'),
('Demo Customer 09','demo.customer09@example.test','customer-login-uses-plate-and-phone','9000000009','customer','DC','active'),
('Demo Customer 10','demo.customer10@example.test','customer-login-uses-plate-and-phone','9000000010','customer','DC','active'),
('Demo Customer 11','demo.customer11@example.test','customer-login-uses-plate-and-phone','9000000011','customer','DC','active'),
('Demo Customer 12','demo.customer12@example.test','customer-login-uses-plate-and-phone','9000000012','customer','DC','active'),
('Demo Customer 13','demo.customer13@example.test','customer-login-uses-plate-and-phone','9000000013','customer','DC','active'),
('Demo Customer 14','demo.customer14@example.test','customer-login-uses-plate-and-phone','9000000014','customer','DC','active'),
('Demo Customer 15','demo.customer15@example.test','customer-login-uses-plate-and-phone','9000000015','customer','DC','active');
INSERT IGNORE INTO vehicles (customer_id,registration_number,brand,model,manufacturing_year,current_km,color) SELECT u.id, d.plate, d.brand, d.model, d.year, d.km, d.color FROM (
SELECT 'demo.customer01@example.test' email, 'GJ01DE0001' plate, 'Maruti Suzuki' brand, 'Swift' model, 2019 year, 12350 km, 'White' color
UNION ALL
SELECT 'demo.customer02@example.test' email, 'GJ01DE0002' plate, 'Hyundai' brand, 'i20' model, 2020 year, 12700 km, 'Silver' color
UNION ALL
SELECT 'demo.customer03@example.test' email, 'GJ01DE0003' plate, 'Tata' brand, 'Nexon' model, 2021 year, 13050 km, 'Blue' color
UNION ALL
SELECT 'demo.customer04@example.test' email, 'GJ01DE0004' plate, 'Honda' brand, 'City' model, 2022 year, 13400 km, 'Grey' color
UNION ALL
SELECT 'demo.customer05@example.test' email, 'GJ01DE0005' plate, 'Toyota' brand, 'Glanza' model, 2023 year, 13750 km, 'Red' color
UNION ALL
SELECT 'demo.customer06@example.test' email, 'GJ01DE0006' plate, 'Maruti Suzuki' brand, 'Swift' model, 2024 year, 14100 km, 'White' color
UNION ALL
SELECT 'demo.customer07@example.test' email, 'GJ01DE0007' plate, 'Hyundai' brand, 'i20' model, 2018 year, 14450 km, 'Silver' color
UNION ALL
SELECT 'demo.customer08@example.test' email, 'GJ01DE0008' plate, 'Tata' brand, 'Nexon' model, 2019 year, 14800 km, 'Blue' color
UNION ALL
SELECT 'demo.customer09@example.test' email, 'GJ01DE0009' plate, 'Honda' brand, 'City' model, 2020 year, 15150 km, 'Grey' color
UNION ALL
SELECT 'demo.customer10@example.test' email, 'GJ01DE0010' plate, 'Toyota' brand, 'Glanza' model, 2021 year, 15500 km, 'Red' color
UNION ALL
SELECT 'demo.customer11@example.test' email, 'GJ01DE0011' plate, 'Maruti Suzuki' brand, 'Swift' model, 2022 year, 15850 km, 'White' color
UNION ALL
SELECT 'demo.customer12@example.test' email, 'GJ01DE0012' plate, 'Hyundai' brand, 'i20' model, 2023 year, 16200 km, 'Silver' color
UNION ALL
SELECT 'demo.customer13@example.test' email, 'GJ01DE0013' plate, 'Tata' brand, 'Nexon' model, 2024 year, 16550 km, 'Blue' color
UNION ALL
SELECT 'demo.customer14@example.test' email, 'GJ01DE0014' plate, 'Honda' brand, 'City' model, 2018 year, 16900 km, 'Grey' color
UNION ALL
SELECT 'demo.customer15@example.test' email, 'GJ01DE0015' plate, 'Toyota' brand, 'Glanza' model, 2019 year, 17250 km, 'Red' color) d JOIN users u ON u.email=d.email;
