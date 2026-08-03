-- Make price and size columns nullable so trades can be saved without them
ALTER TABLE journal_entries ALTER COLUMN entry_price DROP NOT NULL;
ALTER TABLE journal_entries ALTER COLUMN exit_price DROP NOT NULL;
ALTER TABLE journal_entries ALTER COLUMN position_size DROP NOT NULL;
