import firebase_admin 
from firebase_admin import credentials, firestore

cred = credentials.Certificate('firebase/firebase_key.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# 테스트용 문서 쓰기
doc_ref = db.collection('test').document('testdoc')
doc_ref.set({'test': 'ok'})
print('Firestore 저장 성공!')