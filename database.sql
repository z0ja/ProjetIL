-- Fichier : database.sql
-- Description : Structure de la base de données pour Watch2Gether

-- 1. Nettoyage : On supprime les tables dans l'ordre inverse des dépendances
-- (On supprime d'abord l'historique car il dépend des users et videos)
DROP TABLE IF EXISTS user_history;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS users;

-- 2. Table USERS (Comptes utilisateurs)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table VIDEOS (Vidéos visionnées)
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    youtube_id VARCHAR(50),            
    title VARCHAR(255),
    url TEXT NOT NULL
);

-- 4. Table USER_HISTORY (Historique de visionnage)
CREATE TABLE user_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);