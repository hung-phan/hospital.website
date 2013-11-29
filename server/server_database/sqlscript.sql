drop table if exists user_table, doctor_table, patient_table, 
    medical_history_table, prescription_table, prescription_detail_table, 
    labaratory_order_table, labaratory_order_detail_table, medical_service_table, 
    service_table, service_detail_table, drug_table, icd_table
go
create table user_table (
    id int primary key auto_increment,
    first_name text,
    last_name text,
    username text,
    password text,
    role text
)
go
create table doctor_table (
    id int primary key auto_increment,
    name text,
    address text,
    phone_number text,
    working_hour text,
    specialist text,
    notice text
)
go
create table patient_table (
    id int primary key auto_increment,
    name text,
    age int,
    gender text,
    address text,
    phone_number text
)
go
create table medical_history_table (
    id int primary key auto_increment,
    visit_date text, 
    patient_id int,
    prescription_id int,
    lab_it int,
    icd_id int,
    service_id int,
    outcome text
)
go
create table prescription_table (
    id int primary key auto_increment,
    doctor_id int
)
go
create table prescription_detail_table (
    id int primary key auto_increment,
    prescription_id int,
    drug_id int,
    quantity int,
    dose text,
    notice text
)
go
create table labaratory_order_table (
    id int primary key auto_increment,
    doctor_id int
)
go
create table labaratory_order_detail_table (
    id int primary key auto_increment,
    labaratory_id int,
    result text
)
go
create table medical_service_table (
    id int primary key auto_increment,
    name text,
    price float
)
go
create table service_table (
    id int primary key auto_increment,
    service_type text 
)
go
create table service_detail_table (
    id int primary key auto_increment,
    service_id int,
    medical_service_id int
)
go
create table drug_table (
    id int primary key auto_increment,
    name text,
    unit text,
    price float
)
go
create table icd_table (
    id int primary key auto_increment,
    name text,
    code text
)
go
