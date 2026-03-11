import { ref, watch } from './vue.esm-browser.js';

export default {
    props: ['isActive', 'geminiApiKey', 'claudeApiKey', 'isCodespace', 'hasGeminiKey', 'hasClaudeKey'],
    emits: ['close', 'save'],
    setup(props, { emit }) {
        const localGeminiKey = ref(props.geminiApiKey);
        const localClaudeKey = ref(props.claudeApiKey);

        // Sync local drafts whenever the modal is opened
        watch(() => props.isActive, (active) => {
            if (active) {
                if (props.isCodespace) {
                    // In Codespaces, always show empty inputs (never reveal existing keys)
                    localGeminiKey.value = '';
                    localClaudeKey.value = '';
                } else {
                    localGeminiKey.value = props.geminiApiKey;
                    localClaudeKey.value = props.claudeApiKey;
                }
            }
        });

        const handleSave = () => {
            emit('save', {
                gemini_api_key: localGeminiKey.value || '',
                claude_api_key: localClaudeKey.value || '',
            });
        };

        return { localGeminiKey, localClaudeKey, handleSave };
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
                <div v-if="isCodespace && (hasGeminiKey || hasClaudeKey)" class="notification is-info is-light mb-4">
                    Default API keys are pre-configured. You can enter your own keys below to override them.
                </div>
                <div class="field">
                    <label class="label">Gemini API Key</label>
                    <div class="control">
                        <input class="input" type="text"
                               v-model="localGeminiKey"
                               :placeholder="isCodespace && hasGeminiKey ? 'Pre-configured key in use' : 'Enter your Gemini API key (optional)'">
                    </div>
                    <p class="help">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" class="button is-small is-link is-light" style="margin-top: 0.5rem;">
                            {{ localGeminiKey ? 'Manage Gemini API Key' : 'Get Gemini API Key' }}
                        </a>
                    </p>
                </div>
                <div class="field">
                    <label class="label">Claude API Key</label>
                    <div class="control">
                        <input class="input" type="text"
                               v-model="localClaudeKey"
                               :placeholder="isCodespace && hasClaudeKey ? 'Pre-configured key in use' : 'Enter your Claude API key (optional)'">
                    </div>
                    <p class="help">
                        <a href="https://console.anthropic.com/settings/keys" target="_blank" class="button is-small is-link is-light" style="margin-top: 0.5rem;">
                            {{ localClaudeKey ? 'Manage Claude API Key' : 'Get Claude API Key' }}
                        </a>
                    </p>
                </div>
            </section>
            <footer class="modal-card-foot" style="justify-content: flex-end;">
                <button class="button is-primary" @click="handleSave">Save</button>
            </footer>
        </div>
    </div>`
};
