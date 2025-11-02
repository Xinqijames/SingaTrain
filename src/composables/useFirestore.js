// src/composables/useFirestore.js
import { db } from '../firebase'        // your initialized Firestore
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'

/**
 * Adds a favorite station to a user's Firestore document
 * @param {string} uid - Firebase user UID
 * @param {{ station: string, label: string }} favorite - favorite station object
 */
export async function addFavoriteFirestore(uid, favorite) {
    if (!uid) throw new Error('No user UID provided')

    const userRef = doc(db, 'users', uid)

    // arrayUnion ensures you don't accidentally overwrite existing favorites
    await updateDoc(userRef, {
        favorite_stations: arrayUnion(favorite)
    })
}
