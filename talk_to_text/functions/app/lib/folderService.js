import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, where, query, orderBy } from 'firebase/firestore';

// 폴더 생성
export const createFolder = async (userId, name) => {
  const folderRef = collection(db, 'users', userId, 'folders');
  const docRef = await addDoc(folderRef, {
    name,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// 폴더 수정
export const updateFolder = async (userId, folderId, name) => {
  const folderRef = doc(db, 'users', userId, 'folders', folderId);
  await updateDoc(folderRef, { name });
};

// 폴더 삭제
export const deleteFolder = async (userId, folderId) => {
  const folderRef = doc(db, 'users', userId, 'folders', folderId);
  await deleteDoc(folderRef);
  // 폴더에 속한 프로젝트의 folderId를 'default' 등으로 변경하는 추가 로직 필요
};

// 폴더 전체 조회
export const getFolders = async (userId) => {
  const folderRef = collection(db, 'users', userId, 'folders');
  const snap = await getDocs(folderRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 프로젝트를 폴더에 추가(이동)
export const moveProjectToFolder = async (userId, projectId, folderId) => {
  const projectRef = doc(db, 'users', userId, 'projects', projectId);
  await updateDoc(projectRef, { folderId });
};

// 특정 폴더에 속한 프로젝트만 조회
export const getProjectsByFolder = async (userId, folderId) => {
  const q = query(
    collection(db, 'users', userId, 'projects'),
    where('folderId', '==', folderId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
}; 