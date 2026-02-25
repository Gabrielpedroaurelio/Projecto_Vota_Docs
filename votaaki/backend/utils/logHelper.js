import db from '../db/config.js';

/**
 * Record Activity Log
 * 
 * @param {number} userId - ID of the user performing the action
 * @param {string} tableName - Name of the table affected
 * @param {number} rowId - ID of the record affected
 * @param {string} action - 'Insert', 'Update', or 'Delete'
 * @param {object} oldData - Object containing previous data (for updates/deletes)
 * @param {object} newData - Object containing new data (for inserts/updates)
 */
export const logActivity = async (userId, tableName, rowId, action, oldData = null, newData = null) => {
    try {
        await db.execute(
            'INSERT INTO ActivityLog (id_user, table_name, row_id, action, old_data, new_data) VALUES (?, ?, ?, ?, ?, ?)',
            [
                userId, 
                tableName, 
                rowId, 
                action, 
                oldData ? JSON.stringify(oldData) : null, 
                newData ? JSON.stringify(newData) : null
            ]
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};
