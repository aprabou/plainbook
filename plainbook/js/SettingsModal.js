import { ref, watch } from './vue.esm-browser.js';

export default {
    props: ['isActive', 'apiKey'],
    emits: ['close', 'save'],
    setup(props, { emit }) {
        // Create a local draft of the API key
        const localKey = ref(props.apiKey);

        // Sync local draft whenever the modal is opened with the current parent value
        watch(() => props.isActive, (active) => {
            if (active) {
                localKey.value = props.apiKey;
            }
        });

        const handleSave = () => {
            emit('save', localKey.value);
        };

        return { localKey, handleSave };
    },
    template: /* html */ `
    <div class="modal" :class="{'is-active': isActive}">
        <div class="modal-background" @click="$emit('close')"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Settings</p>
                <button class="delete" aria-label="close" @click="$emit('close')"></button>
            </header>
            <section class="modal-card-body">
                <div class="field">
                    <label class="label">Gemini API Key</label>
                    <div class="control">
                        <input class="input" type="text" 
                               v-model="localKey" 
                               placeholder="Enter your Gemini API key">
                    </div>
                </div>
            </section>
            <footer class="modal-card-foot" style="justify-content: flex-end;">
                <button class="button is-primary" @click="handleSave">Save</button>
            </footer>
        </div>
    </div>`
};
