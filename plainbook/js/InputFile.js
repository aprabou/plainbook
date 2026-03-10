import { ref, reactive, onMounted, computed, watch } from './vue.esm-browser.js';

export default {
    props: ['authToken'],
    emits: ['file-counts'],
    setup(props, { emit }) {
        const currentPath = ref('/'); // Root path
        const fileList = ref([]);     // Files in the current directory
        const selectedFiles = reactive(new Map()); // Path -> File object mapping
        const missingFiles = reactive(new Map()); // Path -> File object mapping for missing files
        const isLoading = ref(false);
        const filterQuery = ref(''); // Search state
        
        const filteredFiles = computed(() => {
            const query = filterQuery.value.toLowerCase();
            return fileList.value.filter(f => f.name.toLowerCase().includes(query));
        });

        const fetchFiles = async (path) => {
            isLoading.value = true;
            filterQuery.value = ''; // Reset search when changing folders
            try {
                const response = await fetch(`/file_list?token=${props.authToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: path })
                });
                const data = await response.json();
                fileList.value = data.files || []; 
                currentPath.value = path;
            } catch (err) {
                throw new Error("Failed to fetch files", { cause: err });
            } finally {
                isLoading.value = false;
            }
        };

        // Navigation actions
        const openFolder = (folder) => {
            fetchFiles(folder.path);
        };

        const goUp = () => {
            const parts = currentPath.value.split('/').filter(Boolean);
            parts.pop();
            const parentPath = '/' + parts.join('/');
            fetchFiles(parentPath);
        };

        const goHome = async () => {
            try {
                const res = await fetch(`/home_dir?token=${props.authToken}`);
                const data = await res.json();
                await fetchFiles(data.path);
            } catch (err) {
                console.warn('Failed to navigate to home directory:', err);
            }
        };

        const goCurrent = async () => {
            try {
                const res = await fetch(`/current_dir?token=${props.authToken}`);
                const data = await res.json();
                await fetchFiles(data.path);
            } catch (err) {
                console.warn('Failed to navigate to current directory:', err);
            }
        };

        // Selection actions
        const toggleSelection = (file) => {
            if (selectedFiles.has(file.path)) {
                selectedFiles.delete(file.path);
            } else {
                selectedFiles.set(file.path, file);
            }
        };

        const removeSelected = (path) => {
            selectedFiles.delete(path);
        };

        const removeMissing = (path) => {
            missingFiles.delete(path);
        }

        const syncSelectedFiles = async () => {
            // Convert Map values to a plain array of file objects
            try {
                await fetch(`/set_files?token=${props.authToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        files: Array.from(selectedFiles.values()),
                        missing_files: Array.from(missingFiles.values())
                    })
                });
            } catch (err) {
                throw new Error("Failed to sync files with notebook", { cause: err });
            }
        };

        const emitCounts = () => {
            emit('file-counts', { selected: selectedFiles.size, missing: missingFiles.size });
        };

        watch(selectedFiles, () => { syncSelectedFiles(); emitCounts(); }, { deep: true });
        watch(missingFiles,  () => { syncSelectedFiles(); emitCounts(); }, { deep: true });

        // Load selected files mapping from server and populate `selectedFiles`
        const loadSelectedFiles = async () => {
            try {
                const res = await fetch(`/get_files?token=${props.authToken}`);
                if (!res.ok) return;
                const data = await res.json();
                // Clear existing selection and repopulate
                selectedFiles.clear();
                data.files.forEach(f => {
                    selectedFiles.set(f.path, f);
                });
                missingFiles.clear();
                data.missing_files.forEach(f => {
                    missingFiles.set(f.path, f);
                });
                emitCounts();
            } catch (err) {
                console.warn('Failed to load selected input files:', err);
            }
        };

        // Get home dir on load
        const initialize = async () => {
            try {
                const res = await fetch(`/current_dir?token=${props.authToken}`);
                const data = await res.json();
                await fetchFiles(data.path);
                await loadSelectedFiles();
            } catch (err) {
                await fetchFiles('/');
                await loadSelectedFiles();
            }
        };

        // Initial load
        onMounted(initialize);

        return {
            currentPath, fileList, isLoading,
            selectedFiles, missingFiles, filterQuery, filteredFiles,
            openFolder, goUp, goHome, goCurrent, toggleSelection, removeSelected, removeMissing
        };
    },
    template: /* html */ `
            <div style="display: flex; height: 400px; background: white;">
                <div style="flex: 1; border-right: 1px solid #dbdbdb; display: flex; flex-direction: column;">
                    <div style="padding: 0.4rem 0.5rem; background: #eee; font-size: 0.85rem; color: #666;">Select files for notebook access, so AI knows where to find them.</div>
                    <div style="padding: 8px; background: #eee; display: flex; gap: 8px;">
                        <input type="text" v-model="filterQuery" placeholder="Filter files..." 
                            style="flex: 1; padding: 4px; border: 1px solid #ccc;">
                    </div>
                    <div style="padding: 0.25rem; background: #eee; display: flex; gap: 6px; align-items: center;">
                        <button @click="goUp" :disabled="currentPath === '/'" class="button is-small is-light" style="border: 1px solid #ccc;">
                            <span class="icon is-small"><i class="bx bx-arrow-big-up"></i></span>
                            <span>Up</span>
                        </button>
                        <button @click="goHome" class="button is-small is-light" style="border: 1px solid #ccc;">
                            <span class="icon is-small"><i class="bx bx-home"></i></span>
                            <span>Home</span>
                        </button>
                        <button @click="goCurrent" class="button is-small is-light" style="border: 1px solid #ccc;">
                            <span class="icon is-small"><i class="bx bx-target"></i></span>
                            <span>Current</span>
                        </button>
                        <code style="font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ currentPath }}</code>
                    </div>                    
                    <div style="overflow-y: auto; flex: 1;">
                        <div v-if="isLoading" style="padding: 1rem; color: #888;">Loading...</div>
                        <ul v-else style="list-style: none; margin: 0; padding: 0;">
                            <li v-for="item in filteredFiles" :key="item.path"
                                style="padding: 0.1rem 0.5rem; border-bottom: 1px solid #fafafa; display: flex; align-items: center; gap: 4px;">

                                <span style="width: 1rem; min-width: 1rem; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                                    <input type="checkbox" v-if="item.type === 'file'"
                                           :checked="selectedFiles.has(item.path)"
                                           @change="toggleSelection(item)"
                                           style="width: 0.8rem; height: 0.8rem; margin: 0; cursor: pointer;">
                                </span>

                                <span class="icon is-small" :style="item.type === 'directory' ? 'color: #3273dc;' : ''">
                                    <i :class="item.type === 'directory' ? 'bx bx-folder' : 'bx bx-file'"></i>
                                </span>

                                <span v-if="item.type === 'directory'"
                                      @click="openFolder(item)"
                                      style="cursor: pointer; color: #3273dc; font-weight: 500;" class="is-size-7">
                                    {{ item.name }}/
                                </span>
                                <span v-else class="is-size-7">{{ item.name }}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style="width: 300px; background: #fafafa; display: flex; flex-direction: column;">
                    <div style="padding: 0.5rem; font-weight: bold; background: #eee;">Selected Files ({{ selectedFiles.size }})</div>
                    <div style="overflow-y: auto; flex: 1; padding: 0.5rem;">
                        <div v-if="selectedFiles.size === 0" style="color: #ccc; font-style: italic;">No files selected</div>
                        <ul style="list-style: none; margin: 0; padding: 0;">
                            <li v-for="[path, file] in selectedFiles" :key="path"
                                style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: 0.95rem; background: white; padding: 6px; border-radius: 4px; border: 1px solid #eee;">
                                <button @click="removeSelected(path)" class="delete has-background-danger is-small" style="margin-top: 4px;">
                                </button>
                                <div style="display: flex; flex-direction: column; min-width: 0;">
                                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; color: #222;" :title="path">
                                        {{ file.name }}
                                    </div>
                                    <div style="color: #3273dc; font-size: 0.8rem; margin-top: 2px; white-space: normal; word-break: break-all;">
                                        {{ path }}
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div v-if="missingFiles.size > 0" style="padding: 0.5rem; font-weight: bold; background: #eee;" class="has-text-danger">Missing Files ({{ missingFiles.size }})</div>
                    <div v-if="missingFiles.size > 0" style="overflow-y: auto; flex: 1; padding: 0.5rem;">
                        <ul style="list-style: none; margin: 0; padding: 0;">
                            <li v-for="[path, file] in missingFiles" :key="path" 
                                style="display: flex; align-items: center; margin-bottom: 4px; font-size: 0.85rem; background: white; padding: 4px; border-radius: 3px; border: 1px solid #eee;">
                                <button @click="removeMissing(path)" class="delete has-background-danger is-small mr-2">
                                </button>
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="path">
                                    {{ file.name }}
                                </span>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
    `
};
