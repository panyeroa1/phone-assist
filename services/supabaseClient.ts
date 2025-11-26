import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xmshbugkzckvuheqthkj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc2hidWdremNrdnVoZXF0aGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg2MjgsImV4cCI6MjA3OTc0NDYyOH0.xvmqYf0Kf3CHHmlOm1VpXROpKATa_f7e7bptOkLftJk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const uploadAvatar = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
};