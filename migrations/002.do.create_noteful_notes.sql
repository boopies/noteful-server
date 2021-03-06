CREATE TABLE noteful_notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMP DEFAULT now() NOT NULL,
    folder_id INTEGER
        REFERENCES noteful_folders(id) ON DELETE CASCADE NOT NULL
)