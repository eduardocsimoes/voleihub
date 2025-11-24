import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Faz upload de uma foto de perfil
 * @param userId - ID do usuário
 * @param file - Arquivo da imagem
 * @returns URL da imagem ou erro
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<UploadResult> {
  try {
    console.log('📤 Iniciando upload da foto de perfil...');
    
    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Formato inválido. Use JPG, PNG ou WEBP.'
      };
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Arquivo muito grande. Máximo 5MB.'
      };
    }

    // Criar referência no Storage
    const timestamp = Date.now();
    const fileName = `profile-photos/${userId}/${timestamp}.jpg`;
    const storageRef = ref(storage, fileName);

    // Upload
    console.log('⏳ Fazendo upload...');
    await uploadBytes(storageRef, file);

    // Obter URL de download
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Upload concluído:', downloadURL);

    return {
      success: true,
      url: downloadURL
    };

  } catch (error: any) {
    console.error('❌ Erro ao fazer upload:', error);
    return {
      success: false,
      error: error.message || 'Erro ao fazer upload da foto'
    };
  }
}

/**
 * Deleta foto de perfil antiga
 * @param photoURL - URL da foto a ser deletada
 */
export async function deleteProfilePhoto(photoURL: string): Promise<void> {
  try {
    if (!photoURL || !photoURL.includes('firebase')) {
      return;
    }

    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef);
    console.log('🗑️ Foto antiga deletada');
  } catch (error) {
    console.error('❌ Erro ao deletar foto:', error);
    // Não retornar erro, apenas logar
  }
}

/**
 * Redimensiona e comprime uma imagem
 * @param file - Arquivo original
 * @param maxWidth - Largura máxima
 * @param maxHeight - Altura máxima
 * @param quality - Qualidade (0-1)
 * @returns Arquivo redimensionado
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular proporções
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Erro ao criar canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro ao converter imagem'));
              return;
            }

            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            console.log('✅ Imagem redimensionada:', {
              original: `${(file.size / 1024).toFixed(2)}KB`,
              resized: `${(resizedFile.size / 1024).toFixed(2)}KB`
            });

            resolve(resizedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}