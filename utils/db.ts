
import { Player, Team, User, PlayerRegistrationRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'ElkaweraDB';
const DB_VERSION = 6; // Bumped for player registration requests
const PLAYER_STORE = 'players';
const TEAM_STORE = 'teams';
const USER_STORE = 'users';
const REGISTRATION_STORE = 'playerRegistrations';

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject('Database error: ' + (event.target as IDBOpenDBRequest).error);

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction!;

      // Players Store
      if (!db.objectStoreNames.contains(PLAYER_STORE)) {
        const playerStore = db.createObjectStore(PLAYER_STORE, { keyPath: 'id' });
        playerStore.createIndex('teamId', 'teamId', { unique: false });
      } else {
        const playerStore = transaction.objectStore(PLAYER_STORE);
        if (!playerStore.indexNames.contains('teamId')) {
          playerStore.createIndex('teamId', 'teamId', { unique: false });
        }
      }

      // Teams Store
      if (!db.objectStoreNames.contains(TEAM_STORE)) {
        db.createObjectStore(TEAM_STORE, { keyPath: 'id' });
      }

      // Users Store
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const userStore = db.createObjectStore(USER_STORE, { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }

      // Player Registration Requests Store
      if (!db.objectStoreNames.contains(REGISTRATION_STORE)) {
        const regStore = db.createObjectStore(REGISTRATION_STORE, { keyPath: 'id' });
        regStore.createIndex('userId', 'userId', { unique: false });
        regStore.createIndex('status', 'status', { unique: false });
      }
    };
  });
};

// --- AUTH / USERS ---

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  age?: number,
  height?: number,
  weight?: number,
  strongFoot?: 'Left' | 'Right',
  position?: string
): Promise<User> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], 'readwrite');
    const store = transaction.objectStore(USER_STORE);
    const emailIndex = store.index('email');

    const checkRequest = emailIndex.get(email);

    checkRequest.onsuccess = () => {
      if (checkRequest.result) {
        reject('Email already registered');
        return;
      }

      const newUser: User = {
        id: uuidv4(),
        name,
        email,
        passwordHash: password, // Storing as plain text for stability in this demo
        role: 'player',
        age,
        height,
        weight,
        strongFoot,
        position: position as any,
        createdAt: Date.now()
      };

      const addRequest = store.add(newUser);
      addRequest.onsuccess = () => resolve(newUser);
      addRequest.onerror = () => reject('Failed to register user');
    };

    checkRequest.onerror = () => reject('Database error checking email');
  });
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], 'readonly');
    const store = transaction.objectStore(USER_STORE);
    const index = store.index('email');
    const request = index.get(email);

    request.onsuccess = () => {
      const user = request.result as User;
      // Check if user exists AND password matches
      if (user && user.passwordHash === password) {
        resolve(user);
      } else {
        // Handle legacy base64 passwords if any exist from previous version
        if (user && user.passwordHash === btoa(password)) {
          resolve(user);
          return;
        }

        console.warn('Login failed: Invalid credentials for', email);
        reject('Invalid email or password');
      }
    };
    request.onerror = () => reject('Login failed due to database error');
  });
};

export const updateUser = async (user: User): Promise<User> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], 'readwrite');
    const store = transaction.objectStore(USER_STORE);
    const request = store.put(user);

    request.onsuccess = () => resolve(user);
    request.onerror = () => reject('Error updating user');
  });
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], 'readonly');
    const store = transaction.objectStore(USER_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error fetching user');
  });
};

export const getUserByPlayerCardId = async (playerCardId: string): Promise<User | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], 'readonly');
    const store = transaction.objectStore(USER_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const users = request.result as User[];
      const user = users.find(u => u.playerCardId === playerCardId);
      resolve(user);
    };
    request.onerror = () => reject('Error fetching user by player card id');
  });
};

// --- PLAYERS ---

export const savePlayer = async (player: Player): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLAYER_STORE], 'readwrite');
    const store = transaction.objectStore(PLAYER_STORE);
    const request = store.put(player);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error saving player');
  });
};

export const getAllPlayers = async (): Promise<Player[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLAYER_STORE], 'readonly');
    const store = transaction.objectStore(PLAYER_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error fetching players');
  });
};

export const getPlayersByTeamId = async (teamId: string): Promise<Player[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLAYER_STORE], 'readonly');
    const store = transaction.objectStore(PLAYER_STORE);
    const index = store.index('teamId');
    const request = index.getAll(teamId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error fetching team players');
  });
};

export const getPlayerById = async (id: string): Promise<Player | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLAYER_STORE], 'readonly');
    const store = transaction.objectStore(PLAYER_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error fetching player');
  });
};

export const deletePlayer = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLAYER_STORE], 'readwrite');
    const store = transaction.objectStore(PLAYER_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error deleting player');
  });
};

// --- TEAMS ---

export const saveTeam = async (team: Team): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TEAM_STORE], 'readwrite');
    const store = transaction.objectStore(TEAM_STORE);
    const request = store.put(team);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error saving team');
  });
};

export const getAllTeams = async (): Promise<Team[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TEAM_STORE], 'readonly');
    const store = transaction.objectStore(TEAM_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error fetching teams');
  });
};

export const getTeamById = async (id: string): Promise<Team | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TEAM_STORE], 'readonly');
    const store = transaction.objectStore(TEAM_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error fetching team');
  });
};

export const deleteTeam = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TEAM_STORE], 'readwrite');
    const store = transaction.objectStore(TEAM_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error deleting team');
  });
};

// --- PLAYER REGISTRATION REQUESTS ---

export const savePlayerRegistrationRequest = async (request: PlayerRegistrationRequest): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REGISTRATION_STORE], 'readwrite');
    const store = transaction.objectStore(REGISTRATION_STORE);
    const addRequest = store.put(request);

    addRequest.onsuccess = () => resolve();
    addRequest.onerror = () => reject('Error saving registration request');
  });
};

export const getAllPlayerRegistrationRequests = async (): Promise<PlayerRegistrationRequest[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REGISTRATION_STORE], 'readonly');
    const store = transaction.objectStore(REGISTRATION_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error fetching registration requests');
  });
};

export const getPendingPlayerRegistrationRequests = async (): Promise<PlayerRegistrationRequest[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REGISTRATION_STORE], 'readonly');
    const store = transaction.objectStore(REGISTRATION_STORE);
    const statusIndex = store.index('status');
    const request = statusIndex.getAll('pending');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error fetching pending requests');
  });
};

export const getPlayerRegistrationRequestById = async (id: string): Promise<PlayerRegistrationRequest | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REGISTRATION_STORE], 'readonly');
    const store = transaction.objectStore(REGISTRATION_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error fetching registration request');
  });
};

export const updatePlayerRegistrationRequest = async (request: PlayerRegistrationRequest): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REGISTRATION_STORE], 'readwrite');
    const store = transaction.objectStore(REGISTRATION_STORE);
    const updateRequest = store.put(request);

    updateRequest.onsuccess = () => resolve();
    updateRequest.onerror = () => reject('Error updating registration request');
  });
};
