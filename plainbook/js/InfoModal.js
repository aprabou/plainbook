import NotebookHelp from './NotebookHelp.js';

export default {
    props: ['isActive'],
    emits: ['close'],
    components: { NotebookHelp },
    template: /* html */ `
    <div class="modal" :class="{'is-active': isActive}">
        <div class="modal-background" @click="$emit('close')"></div>
        <div class="modal-card" style="width: 90%; max-width: 900px;">
            <header class="modal-card-head">
                <p class="modal-card-title">About Plainbook</p>
                <button class="delete" aria-label="close" @click="$emit('close')"></button>
            </header>
            <section class="modal-card-body">
                <notebook-help />
            </section>
            <footer class="modal-card-foot">
                <button class="button" @click="$emit('close')">Close</button>
            </footer>
        </div>
    </div>`
};
