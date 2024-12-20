-- tasksテーブルの作成
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false,
    due_date TIMESTAMP,
    priority VARCHAR(50) DEFAULT 'medium',
    category VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- サンプルデータの挿入
INSERT INTO tasks (title, completed, due_date, priority, category, tags)
VALUES 
    ('最初のタスク', false, CURRENT_TIMESTAMP + INTERVAL '1 day', 'high', '仕事', ARRAY['重要', '期限あり']),
    ('買い物リスト作成', false, CURRENT_TIMESTAMP + INTERVAL '2 days', 'medium', '個人', ARRAY['買い物', '準備']),
    ('メール返信', true, CURRENT_TIMESTAMP - INTERVAL '1 day', 'low', '仕事', ARRAY['コミュニケーション'])
ON CONFLICT DO NOTHING; 