import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const storage = getStorage();

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/* =========================================================
   FOTO DE PERFIL (mantido intacto)
========================================================= */
export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<UploadResult> {
  try {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Formato inválido." };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "Arquivo muito grande." };
    }

    const fileName = `profile-photos/${userId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProfilePhoto(photoURL: string): Promise<void> {
  try {
    if (!photoURL) return;
    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef);
  } catch {
    // silencioso
  }
}

/* =========================================================
   🎥 SALTO VERTICAL — CLIP DO SALTO
========================================================= */

/**
 * Upload do clipe do salto (Decolagem → Pouso)
 * Path:
 * vertical-jumps/{userId}/jump_{timestamp}.webm
 */
export async function uploadJumpClipToStorage(
  userId: string,
  clipBlob: Blob
): Promise<string> {
  const fileName = `jump_${Date.now()}.webm`;

  const clipRef = ref(storage, `vertical-jumps/${userId}/${fileName}`);

  await uploadBytes(clipRef, clipBlob, {
    contentType: clipBlob.type || "video/webm",
  });

  return await getDownloadURL(clipRef);
}

/**
 * 🗑️ Delete sincronizado do clipe do salto
 * Recebe a URL salva no Firestore
 */
export async function deleteJumpClipFromStorage(
  clipUrl?: string
): Promise<void> {
  try {
    if (!clipUrl) return;

    // ⚠️ IMPORTANTE:
    // quando a URL é completa (https://...), o ref aceita direto
    const clipRef = ref(storage, clipUrl);
    await deleteObject(clipRef);

    console.log("🗑️ Clip de salto removido do Storage");
  } catch (error) {
    console.error("Erro ao deletar clipe do salto:", error);
  }
}

/**
 * Redimensiona e comprime uma imagem
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        } else if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas error");

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Blob error");

            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = reject;
      img.src = reader.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 🖼️ Upload da thumbnail do salto
 * Path:
 * vertical-jumps/{userId}/thumb_{timestamp}.jpg
 */
export async function uploadJumpThumbnailToStorage(
  userId: string,
  thumbnailBlob: Blob
): Promise<string> {
  const fileName = `thumb_${Date.now()}.jpg`;

  const thumbRef = ref(
    storage,
    `vertical-jumps/${userId}/${fileName}`
  );

  await uploadBytes(thumbRef, thumbnailBlob, {
    contentType: "image/jpeg",
  });

  return getDownloadURL(thumbRef);
}

/* =========================================================
   📸 ATHLETE STORIES (CARDS / STORIES)
========================================================= */

export async function uploadAthleteStoryImage(
  userId: string,
  imageBlob: Blob
): Promise<{ url: string; path: string }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const path = `athletes/${userId}/stories/presentation/story_${timestamp}.png`;

  const storyRef = ref(storage, path);

  await uploadBytes(storyRef, imageBlob, {
    contentType: "image/png",
  });

  const url = await getDownloadURL(storyRef);

  return { url, path };
}

export async function uploadAthleteCardImage(
  userId: string,
  format: "feed" | "story",
  file: Blob
): Promise<{ success: boolean; url?: string }> {
  try {
    const fileRef = ref(
      storage,
      `athlete-cards/${userId}/${format}.jpg`
    );

    await uploadBytes(fileRef, file, {
      contentType: "image/jpeg",
    });

    const url = await getDownloadURL(fileRef);

    return { success: true, url };
  } catch (error) {
    console.error("Erro ao subir imagem do card:", error);
    return { success: false };
  }
}
