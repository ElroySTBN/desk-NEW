import { supabase } from "@/integrations/supabase/client";
import { LogoUploadResult } from "@/types/funnel-config";

/**
 * Upload a client logo to Supabase Storage
 */
export async function uploadClientLogo(
  file: File,
  clientId: string
): Promise<LogoUploadResult> {
  try {
    // Validate file
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Type de fichier non supporté. Utilisez PNG, JPG, SVG ou WEBP.'
      };
    }

    // Limit file size to 2MB
    if (file.size > 2 * 1024 * 1024) {
      return {
        success: false,
        error: 'Le fichier est trop volumineux. Maximum 2MB.'
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('client-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: `Erreur d'upload: ${error.message}`
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client-logos')
      .getPublicUrl(data.path);

    // Update client record with logo URL
    const { error: updateError } = await supabase
      .from('clients')
      .update({ logo_url: publicUrl })
      .eq('id', clientId);

    if (updateError) {
      console.error('Error updating client:', updateError);
      return {
        success: false,
        error: 'Logo uploadé mais échec de mise à jour du client'
      };
    }

    return {
      success: true,
      url: publicUrl
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: 'Erreur inattendue lors de l\'upload'
    };
  }
}

/**
 * Delete a client logo from Supabase Storage
 */
export async function deleteClientLogo(clientId: string, logoUrl: string): Promise<boolean> {
  try {
    // Extract path from URL
    const urlParts = logoUrl.split('/client-logos/');
    if (urlParts.length < 2) {
      console.error('Invalid logo URL');
      return false;
    }

    const filePath = urlParts[1];

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('client-logos')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting logo:', deleteError);
      return false;
    }

    // Update client record
    const { error: updateError } = await supabase
      .from('clients')
      .update({ logo_url: null })
      .eq('id', clientId);

    if (updateError) {
      console.error('Error updating client:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

/**
 * Get client logo URL
 */
export async function getClientLogo(clientId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('logo_url')
      .eq('id', clientId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.logo_url;
  } catch (error) {
    console.error('Error fetching logo:', error);
    return null;
  }
}

