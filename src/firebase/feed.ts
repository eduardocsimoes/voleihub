import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot,
  } from "firebase/firestore";
  import { db } from "./config";
  
  /* ============================================
      🔵 TIPAGENS DO FEED
  ============================================ */
  
  export interface FeedAuthor {
    uid: string;
    name: string;
    photoURL?: string;
    position?: string;
  }
  
  export interface FeedLike {
    userId: string;
    createdAt: Date;
  }
  
  export interface FeedComment {
    id: string;
    userId: string;
    text: string;
    createdAt: Date;
  }
  
  export interface FeedPost {
    id: string;
    author: FeedAuthor;
    text: string;
    imageUrl?: string;
    createdAt: Date;
    likes: FeedLike[];
    comments: FeedComment[];
  }
  
  /* ============================================
      🔵 CRIAR POST
  ============================================ */
  
  export async function createPost(data: {
    author: FeedAuthor;
    text: string;
    imageUrl?: string;
  }) {
    const ref = await addDoc(collection(db, "feed"), {
      ...data,
      likes: [],
      comments: [],
      createdAt: serverTimestamp(),
    });
  
    return ref.id;
  }
  
  /* ============================================
      🔵 BUSCAR TODOS OS POSTS
  ============================================ */
  
  export async function getAllPosts(): Promise<FeedPost[]> {
    const q = query(
      collection(db, "feed"),
      orderBy("createdAt", "desc")
    );
  
    const snap = await getDocs(q);
  
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
  
      return {
        id: docSnap.id,
        author: data.author,
        text: data.text,
        imageUrl: data.imageUrl,
        likes: data.likes || [],
        comments: (data.comments || []).map((c: any) => ({
          ...c,
          createdAt: c.createdAt?.toDate?.() ?? new Date(),
        })),
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as FeedPost;
    });
  }
  
  /* ============================================
      🔵 OUVIR FEED EM TEMPO REAL
  ============================================ */
  
  export function listenToFeed(callback: (posts: FeedPost[]) => void) {
    const q = query(collection(db, "feed"), orderBy("createdAt", "desc"));
  
    return onSnapshot(q, (snap) => {
      const posts = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          author: data.author,
          text: data.text,
          imageUrl: data.imageUrl,
          likes: data.likes || [],
          comments: (data.comments || []).map((c: any) => ({
            ...c,
            createdAt: c.createdAt?.toDate?.() ?? new Date(),
          })),
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        } as FeedPost;
      });
  
      callback(posts);
    });
  }
  
  /* ============================================
      🔵 BUSCAR POST POR ID
  ============================================ */
  
  export async function getPostById(postId: string): Promise<FeedPost | null> {
    const ref = doc(db, "feed", postId);
    const snap = await getDoc(ref);
  
    if (!snap.exists()) return null;
  
    const data = snap.data();
  
    return {
      id: snap.id,
      author: data.author,
      text: data.text,
      imageUrl: data.imageUrl,
      likes: data.likes || [],
      comments: (data.comments || []).map((c: any) => ({
        ...c,
        createdAt: c.createdAt?.toDate?.() ?? new Date(),
      })),
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  }
  
  /* ============================================
      🔵 BUSCAR POSTS DE UM USUÁRIO
  ============================================ */
  
  export async function getUserPosts(userId: string): Promise<FeedPost[]> {
    const q = query(
      collection(db, "feed"),
      where("author.uid", "==", userId),
      orderBy("createdAt", "desc")
    );
  
    const snap = await getDocs(q);
  
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
  
      return {
        id: docSnap.id,
        author: data.author,
        text: data.text,
        imageUrl: data.imageUrl,
        likes: data.likes || [],
        comments: (data.comments || []).map((c: any) => ({
          ...c,
          createdAt: c.createdAt?.toDate?.() ?? new Date(),
        })),
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as FeedPost;
    });
  }
  
  /* ============================================
      🔵 ATUALIZAR POST
  ============================================ */
  
  export async function updatePost(postId: string, data: Partial<FeedPost>) {
    const ref = doc(db, "feed", postId);
    await updateDoc(ref, data as any);
  }
  
  /* ============================================
      🔵 DELETAR POST
  ============================================ */
  
  export async function deletePost(postId: string) {
    await deleteDoc(doc(db, "feed", postId));
  }
  
  /* ============================================
      🔵 CURTIR / DESCURTIR POST
  ============================================ */
  
  export async function toggleLike(postId: string, userId: string) {
    const postRef = doc(db, "feed", postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;
  
    const data = snap.data();
    const likes = data.likes || [];
  
    const alreadyLiked = likes.some((l: any) => l.userId === userId);
  
    const updatedLikes = alreadyLiked
      ? likes.filter((l: any) => l.userId !== userId)
      : [...likes, { userId, createdAt: new Date() }];
  
    await updateDoc(postRef, { likes: updatedLikes });
  }
  
  /* ============================================
      🔵 ADICIONAR COMENTÁRIO
  ============================================ */
  
  export async function addComment(
    postId: string,
    userId: string,
    text: string
  ) {
    const postRef = doc(db, "feed", postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;
  
    const data = snap.data();
    const comments = data.comments || [];
  
    const newComment: FeedComment = {
      id: crypto.randomUUID(),
      userId,
      text,
      createdAt: new Date(),
    };
  
    await updateDoc(postRef, {
      comments: [...comments, newComment],
    });
  }
  