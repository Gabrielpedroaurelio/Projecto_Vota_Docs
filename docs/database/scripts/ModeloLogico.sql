-- Standardized English Logical Model
-- Reference to tables, constraints and basic structure.

DROP DATABASE IF EXISTS vota_aqui;
CREATE DATABASE vota_aqui;
USE vota_aqui;

-- Follows the same structure as ModeloFisico.sql but focused on logical relations.
-- [User] 1 --- N [Poll]
-- [Poll] 1 --- N [Poll_VoteOption]
-- [VoteOption] 1 --- N [Poll_VoteOption]
-- [User] 1 --- N [Vote]
-- [Poll_VoteOption] 1 --- N [Vote]
-- [User] 1 --- N [ActivityLog]
-- [User] 1 --- N [LoginLog]

-- Refer to ModeloFisico.sql for full implementation.