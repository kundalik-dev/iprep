/**
 * IprepPaths — canonical path resolver for the ~/.iprep/ home directory.
 *
 * Imported by both the CLI and the server so every package resolves
 * user data from the same location: os.homedir() + '/.iprep'.
 *
 * On Windows : C:\Users\<name>\.iprep\
 * On macOS   : /Users/<name>/.iprep/
 * On Linux   : /home/<name>/.iprep/
 */

import os from 'os';
import path from 'path';

export const IPREP_HOME = path.join(os.homedir(), '.iprep');

export const IprepPaths = {
  // The directory where iprep stores all user data, including configs, logs, and cache.

  /** Root: ~/.iprep/ */
  root: IPREP_HOME,

  /** All aitutor configs: ~/.iprep/aitutors/ */
  aitutors: path.join(IPREP_HOME, 'aitutors'),

  /** SQLite database folder: ~/.iprep/database/ */
  database: path.join(IPREP_HOME, 'database'),

  /** SQLite file: ~/.iprep/database/iprep.db */
  dbFile: path.join(IPREP_HOME, 'database', 'iprep.db'),

  /** Project docs folder: ~/.iprep/docs/ */
  docs: path.join(IPREP_HOME, 'docs'),

  /** Config root for a specific tutor: ~/.iprep/aitutors/{uuid}/ */
  tutor: (id: string) => path.join(IPREP_HOME, 'aitutors', id),

  /** User-uploaded documents for a tutor: ~/.iprep/aitutors/{uuid}/documents/ */
  documents: (id: string) => path.join(IPREP_HOME, 'aitutors', id, 'documents'),

  /** Tutor-specific Claude Code skills: ~/.iprep/aitutors/{uuid}/skills/ */
  tutorSkills: (id: string) => path.join(IPREP_HOME, 'aitutors', id, 'skills'),

  /** Global Claude Code skills: ~/.iprep/skills/ */
  skills: path.join(IPREP_HOME, 'skills'),

  /** Shared avatar image pool: ~/.iprep/public/images/avatars/ */
  avatarsDir: path.join(IPREP_HOME, 'public', 'images', 'avatars'),

  /** Avatar → tutor assignment map: ~/.iprep/avatar-assignments.json */
  avatarAssignments: path.join(IPREP_HOME, 'avatar-assignments.json'),

  /** Interview session records: ~/.iprep/sessions.json */
  sessions: path.join(IPREP_HOME, 'sessions.json'),

  /** Database backups: ~/.iprep/backups/ */
  backups: path.join(IPREP_HOME, 'backups'),

  /** BYOK API keys (encrypted): ~/.iprep/.keys */
  keysFile: path.join(IPREP_HOME, '.keys'),
};
