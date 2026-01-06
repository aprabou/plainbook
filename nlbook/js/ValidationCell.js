import {ref, watch, nextTick, computed} from './vue.esm-browser.js';

export default {
    props: ['validation', 'index'],
    emits: ['dismiss_validation'],
    
    setup(props, { emit }) {
        const md = window.markdownit();
        const renderedMarkdown = computed(() => {
            return props.validation?.message ? md.render(props.validation.message) : '';
        });

        const dismiss = () => {
            if (props.validation) {
                props.validation.is_hidden = true;
            }
            emit('dismiss_validation', props.index);
        };
        return { dismiss, renderedMarkdown };
    },

    template: /* html */ `
    <div 
        class="validation-cell" 
        :class="validation?.is_valid ? 'has-background-success-light' : 'has-background-danger-light'"
        style="position: relative; min-height: 1.75rem;"
    >
        <div class="validation-dismiss p-2 pr-6 content is-small" v-html="renderedMarkdown"></div>
        <button @click="dismiss" class="delete"
              style="cursor: pointer; position: absolute; top: 2px; right: 2px;">
        </button>
    </div>
    `
};