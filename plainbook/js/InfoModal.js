export default {
    props: ['isActive'],
    emits: ['close'],
    template: /* html */ `
    <div class="modal" :class="{'is-active': isActive}">
        <div class="modal-background" @click="$emit('close')"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Information</p>
                <button class="delete" aria-label="close" @click="$emit('close')"></button>
            </header>
            <section class="modal-card-body">
                <h1 class="title">Plainbook</h1>
                <div class="content">
                    <p>Plainbook is an interactive notebook application for creating executable documents in natural language.</p>
                    <ul>
                        <li><strong>Action cells:</strong> Generate Python code from English explanations using AI.</li>
                        <li><strong>Markdown cells:</strong> Rich text for documentation.</li>
                    </ul>
                    <p>Locking prevents accidental edits while allowing validation and execution.</p>
                    <p><a href="https://github.com/lucadealfaro/plainbook" target="_blank">Plainbook Home Page</a></p>
                </div>
            </section>
            <footer class="modal-card-foot">
                <button class="button" @click="$emit('close')">Close</button>
            </footer>
        </div>
    </div>`
};
