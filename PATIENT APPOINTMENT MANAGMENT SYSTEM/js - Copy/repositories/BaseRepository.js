/**
 * BaseRepository - Base class for all data repositories
 * Handles localStorage operations
 */
class BaseRepository {
    constructor(storageKey) {
        this.storageKey = storageKey;
        this.data = this.loadData();
    }

    /**
     * Load data from localStorage
     * @returns {Array} Array of data items
     */
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error(`Error loading data from ${this.storageKey}:`, error);
            return [];
        }
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error(`Error saving data to ${this.storageKey}:`, error);
            throw new Error('Failed to save data');
        }
    }

    /**
     * Get all items
     * @returns {Array} All items
     */
    getAll() {
        return [...this.data];
    }

    /**
     * Get item by ID
     * @param {number} id - Item ID
     * @returns {Object|null} Item or null if not found
     */
    getById(id) {
        return this.data.find(item => item.id === id) || null;
    }

    /**
     * Create new item
     * @param {Object} item - Item to create
     * @returns {Object} Created item with ID
     */
    create(item) {
        const newItem = {
            ...item,
            id: Date.now() + Math.random(), // Ensure uniqueness
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.data.push(newItem);
        this.saveData();
        return newItem;
    }

    /**
     * Update existing item
     * @param {number} id - Item ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated item or null if not found
     */
    update(id, updates) {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) return null;

        this.data[index] = {
            ...this.data[index],
            ...updates,
            id: this.data[index].id, // Preserve ID
            createdAt: this.data[index].createdAt, // Preserve creation date
            updatedAt: new Date().toISOString()
        };
        this.saveData();
        return this.data[index];
    }

    /**
     * Delete item by ID
     * @param {number} id - Item ID
     * @returns {boolean} True if deleted, false if not found
     */
    delete(id) {
        const initialLength = this.data.length;
        this.data = this.data.filter(item => item.id !== id);
        
        if (this.data.length < initialLength) {
            this.saveData();
            return true;
        }
        return false;
    }

    /**
     * Find items matching criteria
     * @param {Function} predicate - Filter function
     * @returns {Array} Matching items
     */
    find(predicate) {
        return this.data.filter(predicate);
    }

    /**
     * Clear all data
     */
    clear() {
        this.data = [];
        this.saveData();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseRepository;
}
