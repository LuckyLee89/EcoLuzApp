import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mboaulgjjxlmfvmoadde.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ib2F1bGdqanhsbWZ2bW9hZGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzM0NTQsImV4cCI6MjA2NTE0OTQ1NH0.ytLN0wG0sD-o0KiC0JsrfEF1QZJCX0gV-r2RX8Kpwug';

export const supabase = createClient(supabaseUrl, supabaseKey);
