# HR Law Pro Development Plan

## Project Overview
Build a web and mobile AI Legal Advisor application that provides legal guidance based on a controlled administrator-managed knowledge base, with optional web search capability.

**Tech Stack:** Next.js 15 (web) + React Native (mobile) frontend, Supabase (backend + auth + vector DB), Google Gemini AI

## Implementation Phases

### Phase 1: Core Infrastructure & Admin Panel (Weeks 1-2)
**Priority: Get document ingestion working first**

1. **Supabase Setup**
   - [ ] Create Supabase project
   - [ ] Enable pgvector extension
   - [ ] Set up `legal_documents` table with HNSW index
   - [ ] Configure Supabase Storage bucket for documents
   - [ ] Create RLS policies for admin-only document management
   - [ ] Set up service role for secure edge function operations

2. **Admin Authentication**
   - [ ] Implement Supabase Auth
   - [ ] Create admin role with custom claims
   - [ ] Build admin login/signup flow
   - [ ] Protect admin routes with middleware

3. **Knowledge Management UI (Next.js)**
   - [ ] Admin dashboard layout with shadcn/ui
   - [ ] File upload drag-drop interface (react-dropzone)
   - [ ] Preview modal for document content verification
   - [ ] Document table with search/filter
   - [ ] Jurisdiction and document type tagging
   - [ ] Metadata editor (title, jurisdiction, document type)

4. **Document Processing Pipeline**
   - [ ] Edge function for document processing (PDF, Word, TXT, images)
   - [ ] Text extraction: pdf-parse, mammoth, ocr via tesseract.js
   - [ ] Legal document chunking (section-based splitting)
   - [ ] Google gemini-embedding-001 embedding generation
   - [ ] Parallel processing (100 documents/edge function)
   - [ ] Error handling and retry logic
   - [ ] Processing status tracking in UI

**Key Considerations:**
- File validation: Max 10MB, supported formats only
- Hierarchical chunking preserves legal document structure
- Document deduplication by content hash
- Batch processing for admin efficiency

### Phase 2: User Chatbot (Weeks 3-4)
**Priority: Get chat working with internal docs only**

1. **User Authentication**
   - [ ] Signup/login flow for end users
   - [ ] Row-level security (RLS) for user data isolation
   - [ ] Admin can view all users (for monitoring)

2. **Chat Interface (Next.js)**
   - [ ] Main chat page with Vercel AI SDK
   - [ ] Real-time message streaming (Server-Sent Events)
   - [ ] Conversation history sidebar
   - [ ] Mobile-responsive design (Tailwind)
   - [ ] Loading states and error handling

3. **Document Retrieval & AI Integration**
   - [ ] Hybrid search function (semantic + keyword)
   - [ ] MCP server for Gemini integration
   - [ ] Gemini prompts for:
     - Question clarification (ask follow-ups for jurisdiction/context)
     - Document analysis and answer generation
     - Source citation with exact references
   - [ ] System prompt enforcing internal docs only (no external knowledge)
   - [ ] Document context injection to Gemini

4. **Conversation Database**
   - [ ] `conversations` table with metadata
   - [ ] `messages` table storing Q&A history
   - [ ] RLS: Users see only their own conversations
   - [ ] Admin can query all conversations

**Key Considerations:**
- Vault AI SDK for streaming reliability
- Hybrid search balances semantic + exact keyword matching
- Gemini temperature 0.1 for factual consistency
- Maximum 10 retrieved documents per query
- Document citations: "[Document: Civil Code § 123, page 4]"

### Phase 3: Web Search Integration (Week 5)
**Priority: Add optional web search as explicit user choice**

1. **Web Search Toggle**
   - [ ] Toggle switch in chat UI (default: OFF)
   - [ ] Visual indicator when web search enabled
   - [ ] Confirm state with user before each query

2. **AI Logic Modifications**
   - [ ] Conditional search: IF web_search=true THEN call search API
   - [ ] Perplexity API integration (or Tavily/Exa)
   - [ ] Source tracking: collect all URLs used
   - [ ] Gemini prompt update to handle web results
   - [ ] Add citation markers ^[1] immediately after sourced info
   - [ ] Append "Sources" section with URLs

3. **Source Attribution**
   - [ ] Extract relevant legal information from web
   - [ ] Match web content format to internal docs
   - [ ] Numbered citations throughout response
   - [ ] Sources list at end: "1. https://example.com/legal-resource"

**Key Considerations:**
- Never use web search unless user explicitly enables it
- Web search only supplements, doesn't replace internal docs
- Clear visual distinction between internal vs web sources

### Phase 4: Conversation Summaries & Quality (Week 6)
**Priority: Add end-conversation summaries**

1. **End Conversation Feature**
   - [ ] "End Chat" button in UI
   - [ ] Confirmation modal
   - [ ] API endpoint to trigger summarization

2. **AI-Powered Summaries**
   - [ ] Gemini generates:
     - "Key Advice": main legal conclusions
     - "Actions to Take": specific next steps
   - [ ] Store in `conversation_summaries` table

3. **Admin Monitoring**
   - [ ] Admin dashboard showing all user conversations
   - [ ] Filter by date, user, jurisdiction
   - [ ] Export conversation transcripts
   - [ ] Quality metrics dashboard

### Phase 5: Mobile App (React Native, Weeks 7-8)
**Priority: Replicate web app in React Native**

1. **React Native Setup**
   - [ ] React Native with TypeScript
   - [ ] Expo or React Native CLI (recommend Expo for faster dev)
   - [ ] Navigation (React Navigation)
   - [ ] Shared types with web app

2. **Shared Logic**
   - [ ] Extract Supabase client to shared package
   - [ ] Shared validation schemas
   - [ ] Common utilities for document processing

3. **Mobile-Specific Features**
   - [ ] Native file upload (camera roll + document picker)
   - [ ] Push notifications for admin alerts
   - [ ] Offline message queue
   - [ ] Mobile-optimized chat UI
   - [ ] Responsive to different screen sizes

4. **Build & Deploy**
   - [ ] iOS build configuration
   - [ ] Android build configuration
   - [ ] App Store submission
   - [ ] Google Play submission

## Technical Stack

### Frontend Web (Next.js 15)
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui for components
- **AI Integration:** Vercel AI SDK with Google Gemini
- **Authentication:** NextAuth.js or Supabase Auth Helpers
- **File Upload:** react-dropzone
- **State Management:** React hooks + Zustand (if needed)
- **Form Validation:** React Hook Form + Zod

### Mobile (React Native)
- **Framework:** React Native with TypeScript
- **Router:** React Navigation
- **UI:** NativeBase or React Native Paper
- **File Upload:** react-native-document-picker, react-native-image-picker
- **Storage:** @react-native-async-storage/async-storage
- **Notifications:** @react-native-firebase/messaging

### Backend (Supabase)
- **Database:** PostgreSQL with pgvector extension
- **Storage:** Supabase Storage for documents
- **Auth:** Supabase Auth with custom claims
- **Edge Functions:** Document processing pipeline
- **RLS:** Row-level security policies
- **Plan:** Supabase Free Tier (account: chrischowai1@gmail.com)
- **Setup:** Will guide user to provide API keys and authentication when needed

### AI/ML
- **Embeddings:** Google gemini-embedding-001 (1536 dimensions)
- **Vector Search:** Supabase pgvector with HNSW index
- **Chat Model:** Google gemini-2.5-flash
- **Summarization:** Google gemini-2.5-flash
- **Vector Dimensions:** 1536 (Google gemini-embedding-001 default)
- **Distance Metric:** Cosine similarity

### Document Processing Libraries
- **PDF:** pdf-parse, pdf-lib
- **Word:** mammoth, office-text-extractor
- **Images:** tesseract.js (OCR)
- **URLs:** cheerio (static), puppeteer (complex sites)
- **Chunking:** LangChain RecursiveCharacterTextSplitter

## Database Schema

```sql
-- Legal documents with embeddings
CREATE TABLE legal_documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    content       TEXT NOT NULL,
    metadata      JSONB DEFAULT '{}', -- {jurisdiction, doc_type, source, page}
    embedding     VECTOR(1536),
    document_type VARCHAR(50),
    jurisdiction  VARCHAR(100),
    client_id     UUID, -- Admin who uploaded it
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for semantic search
CREATE INDEX legal_docs_embedding_hnsw_idx ON legal_documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Conversations
CREATE TABLE conversations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES auth.users(id),
    title          TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    role            VARCHAR(10), -- 'user' | 'assistant'
    content         TEXT NOT NULL,
    metadata        JSONB, -- {sources: [], web_search_enabled: bool}
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation summaries
CREATE TABLE conversation_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    key_advice      TEXT NOT NULL,
    actions_to_take TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security policies
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id OR auth.has_role('admin'));

-- Admins can see all data
CREATE POLICY "Admins can view all documents"
  ON legal_documents FOR SELECT
  USING (auth.has_role('admin'));
```

## Security

- RLS policies enforcing user data isolation
- Admin role with elevated privileges
- Encrypted document storage
- Rate limiting on API endpoints

## Development Workflow

### Phase 1: Setup (1-2 days)
1. Initialize Next.js 15 project with TypeScript
2. Set up Supabase project with pgvector
3. Configure shadcn/ui components
4. Initialize GitHub repository
5. Configure environment variables

### Phase 2: Admin Infrastructure (5-7 days)
1. Build Supabase tables and RLS policies
2. Implement admin authentication
3. Create document upload UI
4. Build document processing edge function
5. Test PDF, Word, TXT, image processing

### Phase 3: Chat Interface (5-7 days)
1. User authentication
2. Chat UI with Vercel AI SDK
3. Document retrieval integration
4. Gemini API integration
5. Conversation persistence

### Phase 4: Web Search (3-5 days)
1. Implement toggle in UI
2. Integrate Perplexity API
3. Update Gemini prompts
4. Source attribution system
5. Testing with real queries

### Phase 5: Summaries (3-5 days)
1. "End chat" button implementation
2. Gemini summarization API
3. Summary storage and display
4. Admin monitoring dashboard

### Phase 6: Mobile (7-10 days)
1. React Native setup
2. Port authentication
3. Replicate chat interface
4. Native file upload
5. Build and test on devices

### Testing Strategy
- Unit tests for document processing
- Integration tests for chat flow
- E2E tests for admin workflows
- Manual testing of legal document scenarios
- Load testing for concurrent users

### Deployment
- **Version Control:** GitHub repository for codebase management
- **Web:** Netlify deployment (integrates with GitHub, supports Next.js)
- **Mobile:** App Store (iOS) + Google Play (Android)
- **Supabase:** Managed hosting (US/EU regions for GDPR compliance)
- **Domain:** Custom domain with SSL (Netlify free domain + custom domain option)

## Cost Estimates

### Supabase
- Free tier: Good for development
- Pro: $25/month (production-ready)
- Vector: Additional costs based on embedding count

### Google Gemini
- Embeddings: $0.15 per 1M tokens
- Chat API: Variable based on usage

### Deployment
- Netlify: Free tier (Starter), with paid upgrades available
- GitHub: Free public/private repositories
- React Native: One-time Apple Developer ($99/year), Google Play ($25 one-time)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Document processing timeout | High | Break into chunks, use async queues |
| Gemini hallucinates legal advice | Critical | System prompt + RAG enforcement, admin monitoring |
| Vector search returns irrelevant docs | Medium | Hybrid semantic + keyword, BM25 weighting |
| File upload fails for large files | Medium | Chunk uploads, presigned URLs, resumable |
| PGVector performance degrades | Medium | HNSW tuning, connection pooling, Redis cache |
| User data privacy violation | Critical | Audit RLS policies, encrypt sensitive data |

## MVP Scope (First 3 weeks)

**Week 1:** Supabase setup + Admin auth + Document upload UI
**Week 2:** Document processing pipeline + Basic chat UI
**Week 3:** Gemini integration + Conversation history

This provides a working system for internal testing before adding web search, summaries, and mobile.

## Success Metrics

- Document processing: <30 seconds per 50-page PDF
- Chat response: <5 seconds including retrieval
- Search accuracy: 90% relevant documents in top 5
- Uptime: 99.5% (excluding planned maintenance)
- User satisfaction: 4+ stars average rating

---

**Sources:**
- AI SDS RAG: Apache Kafka, Faiss, pgvector - https://mil.io/pgvector-example
- Building Applications with Supabase Vector DB - https://www.kreante.co/post/build-smart-apps-with-supabase-vector-database-semantic-search-guide
- Supabase Storage RLS - https://blog.promptxl.com/supabase-storage-rls/
- Vercel AI SDK Examples - https://sdk.vercel.ai/examples/chatbot
- React dropzone - https://docs.spacy.io/
