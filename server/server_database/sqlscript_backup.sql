drop table if exists user_table, doctor_table, patient_table, 
    medical_history_table, prescription_table, prescription_detail_table, 
    labaratory_order_table, labaratory_order_detail_table, medical_service_table, 
    service_table, service_detail_table, drug_table, icd_table
go
create table user_table (
    id int primary key auto_increment,
    first_name text character set utf8 collate utf8_unicode_ci,
    last_name text character set utf8 collate utf8_unicode_ci,
    username text character set utf8 collate utf8_unicode_ci,
    password text character set utf8 collate utf8_unicode_ci,
    role text character set utf8 collate utf8_unicode_ci
)
go
create table doctor_table (
    id int primary key auto_increment,
    name text character set utf8 collate utf8_unicode_ci,
    address text character set utf8 collate utf8_unicode_ci,
    phone_number text character set utf8 collate utf8_unicode_ci,
    working_hour text character set utf8 collate utf8_unicode_ci,
    specialist text character set utf8 collate utf8_unicode_ci,
    notice text character set utf8 collate utf8_unicode_ci
)
go
create table patient_table (
    id int primary key auto_increment,
    name text character set utf8 collate utf8_unicode_ci,
    age int,
    gender text character set utf8 collate utf8_unicode_ci,
    address text character set utf8 collate utf8_unicode_ci,
    phone_number text character set utf8 collate utf8_unicode_ci
)
go
create table medical_history_table (
    id int primary key auto_increment,
    visit_date text character set utf8 collate utf8_unicode_ci, 
    patient_id int,
    prescription_id int,
    lab_id int,
    icd_id int,
    service_id int,
    outcome text character set utf8 collate utf8_unicode_ci
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
    dose text character set utf8 collate utf8_unicode_ci,
    notice text character set utf8 collate utf8_unicode_ci
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
    result text character set utf8 collate utf8_unicode_ci
)
go
create table medical_service_table (
    id int primary key auto_increment,
    name text character set utf8 collate utf8_unicode_ci,
    price float
)
go
create table service_table (
    id int primary key auto_increment,
    service_type text character set utf8 collate utf8_unicode_ci 
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
    name text character set utf8 collate utf8_unicode_ci,
    unit text character set utf8 collate utf8_unicode_ci,
    price float
)
go
create table icd_table (
    id int primary key auto_increment,
    name text character set utf8 collate utf8_unicode_ci,
    code text character set utf8 collate utf8_unicode_ci
)
go
