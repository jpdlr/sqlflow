-- PostgreSQL Test Schema
-- This contains your exact schema to test the parser

-- Auditlogs
CREATE TABLE IF NOT EXISTS public.audit_logs
(
    id bigserial NOT NULL,
    create_date timestamp with time zone NOT NULL,
    current_status integer NOT NULL DEFAULT 0,
    user_id bigint NOT NULL,
    type text NOT NULL DEFAULT '',
    content jsonb,
    message text,
    document_id bigint,
    client_id bigint,
    CONSTRAINT audit_logs_pk PRIMARY KEY (id)
);

-- Users
CREATE TABLE IF NOT EXISTS public.users
(
    id bigserial PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    role INT NOT NULL,
    enabled BOOLEAN NOT NULL,
    create_date TIMESTAMP NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    selected_client_id BIGINT,
    last_reset_jwt TEXT
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects
(
    id bigserial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_path TEXT NOT NULL,
    url TEXT NOT NULL,
    documentation JSONB
);

-- Tech Blogs
CREATE TABLE IF NOT EXISTS public.tech_blogs
(
    id bigserial PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES public.users(id),
    create_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_video BOOLEAN DEFAULT FALSE,
    video_url TEXT
);

-- Events
CREATE TABLE IF NOT EXISTS public.events
(
    id bigserial PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    url TEXT,
    type TEXT NOT NULL,
    documentation JSONB
);