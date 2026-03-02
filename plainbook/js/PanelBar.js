import { ref } from './vue.esm-browser.js';
import InputFile from './InputFile.js';
import InstructionsPanel from './InstructionsPanel.js';

export default {
    props: ['authToken'],
    components: { InputFile, InstructionsPanel },
    setup() {
        const activeTab = ref(null);
        const selectedCount = ref(0);
        const missingCount = ref(0);

        const toggleTab = (name) => {
            activeTab.value = activeTab.value === name ? null : name;
        };

        const onFileCounts = ({ selected, missing }) => {
            selectedCount.value = selected;
            missingCount.value = missing;
        };

        return { activeTab, toggleTab, selectedCount, missingCount, onFileCounts };
    },
    template: /* html */ `
        <div style="background-color: #f5f5f5; border: 1px solid #dbdbdb; border-radius: 4px;">
            <div style="display: flex; gap: 0; background: transparent; padding: 0;">
                <button
                    @click="toggleTab('files')"
                    style="background: transparent; border: none; padding: 0.6rem 1rem; cursor: pointer; font-size: 0.9rem; border-bottom: 2px solid transparent;"
                    :style="activeTab === 'files' ? 'font-weight: 700; border-bottom-color: #3273dc; color: #3273dc;' : 'color: #555;'"
                >
                    <span style="margin-right: 0.3rem;">&#128193;</span> Files
                    <span style="display: inline-block; background: gray; color: white; border-radius: 999px; padding: 0.12rem 0.45rem; margin-left: 0.4rem; font-size: 0.8rem; font-weight: 600;">
                        {{ selectedCount }}
                    </span>
                    <span v-if="missingCount > 0" class="has-background-danger" style="display: inline-block; color: white; border-radius: 999px; padding: 0.12rem 0.45rem; margin-left: 0.3rem; font-size: 0.8rem; font-weight: 600;">
                        {{ missingCount }}
                    </span>
                </button>
                <button
                    @click="toggleTab('instructions')"
                    style="background: transparent; border: none; padding: 0.6rem 1rem; cursor: pointer; font-size: 0.9rem; border-bottom: 2px solid transparent;"
                    :style="activeTab === 'instructions' ? 'font-weight: 700; border-bottom-color: #3273dc; color: #3273dc;' : 'color: #555;'"
                >
                    <span style="margin-right: 0.3rem;">&#128220;</span> Instructions
                </button>
            </div>
            <div v-show="activeTab === 'files'" style="border-top: 1px solid #dbdbdb;">
                <input-file :auth-token="authToken" @file-counts="onFileCounts" />
            </div>
            <div v-if="activeTab === 'instructions'" style="border-top: 1px solid #dbdbdb;">
                <instructions-panel :auth-token="authToken" />
            </div>
        </div>
    `
};
