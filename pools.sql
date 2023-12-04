
create database if not exists pools;
use	 pools;

drop table if exists user,pool,asset,permissions,pool_check_record;
create table if not exists user(
	id int AUTO_INCREMENT primary key,
	name varchar(100) unique, 
  role varchar(10)
);-- all users on one table with their rolw. tbd: password, email,sessions

create table if not exists asset(
	id int AUTO_INCREMENT primary key,
	name varchar(100) unique, 
  owner_user_id int,
  status text 
); --should the app enforces that the role of the user referenced by owner_user_id is owner?

create table if not exists pool(
	id int AUTO_INCREMENT primary key,
  asset_id int,
  name varchar(100) unique,  
  status text 
);

create table if not exists permissions(
  opeator_user_id int,
  pool_id int
); --should the app enforces that the role of the user referenced by opeator_user_id is operator?
create table pool_check_record(
  operator_user_id int,
  date int,
  pool_id int,
  details int
);-- doc says add asset_id, but it can be inffered from the pool table or maybe add it to remmebr what asset it was when the check happend?
--ading some test data
insert into user (id,name,role) values (1,'ido.operator@gmail.com','operator');
insert into user (id,name,role) values (2,'roi.operator@gmail.com','operator');
insert into user (id,name,role) values (3,'boaz.operator@gmail.com','operator');
insert into user (id,name,role) values (4,'shlomo.owner@gmail.com','owner');
insert into user (id,name,role) values (5,'david.owner@gmail.com','owner');

insert into asset (id,name,owner_user_id) values(1,'Kfar Macabia',4);

insert into pool(id,asset_id,name,status) values(1,1,'Big Pool 1','pool is functional with minor problem');
insert into pool(id,asset_id,name,status) values(2,1,'Big Pool 2','under renovations');
insert into pool(id,asset_id,name,status) values(3,1,'Small Pool 1','under renovations');

insert into permissions(opeator_user_id,pool_id) values(1,1);
insert into permissions(opeator_user_id,pool_id) values(2,2);

