-- Shared conversations table
CREATE TABLE shared_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE shared_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for shared_conversations
CREATE POLICY "Users can create shared links for their conversations"
  ON shared_conversations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view their own shared links"
  ON shared_conversations FOR SELECT
  USING (created_by = auth.uid() OR is_public = true);

CREATE POLICY "Users can update their own shared links"
  ON shared_conversations FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own shared links"
  ON shared_conversations FOR DELETE
  USING (created_by = auth.uid());

-- Generated images table
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID REFERENCES conversations(id),
  prompt TEXT NOT NULL,
  image_url TEXT,
  image_base64 TEXT,
  style TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Policies for generated_images
CREATE POLICY "Users can view their own images"
  ON generated_images FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create images"
  ON generated_images FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own images"
  ON generated_images FOR DELETE
  USING (user_id = auth.uid());

-- Uploaded documents table
CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID REFERENCES conversations(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,
  extracted_text TEXT,
  summary TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Policies for uploaded_documents
CREATE POLICY "Users can view their own documents"
  ON uploaded_documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can upload documents"
  ON uploaded_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own documents"
  ON uploaded_documents FOR DELETE
  USING (user_id = auth.uid());

-- Conversation templates table
CREATE TABLE conversation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  system_prompt TEXT NOT NULL,
  sample_messages JSONB,
  is_public BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversation_templates ENABLE ROW LEVEL SECURITY;

-- Policies for templates (public read)
CREATE POLICY "Anyone can view public templates"
  ON conversation_templates FOR SELECT
  USING (is_public = true);

-- Message reactions table
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for message_reactions
CREATE POLICY "Users can view reactions"
  ON message_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions"
  ON message_reactions FOR DELETE
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_shared_conversations_token ON shared_conversations(share_token);
CREATE INDEX idx_shared_conversations_conversation_id ON shared_conversations(conversation_id);
CREATE INDEX idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX idx_generated_images_conversation_id ON generated_images(conversation_id);
CREATE INDEX idx_uploaded_documents_user_id ON uploaded_documents(user_id);
CREATE INDEX idx_uploaded_documents_conversation_id ON uploaded_documents(conversation_id);
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);