export default {
    props: ['name'],
    template: /* html */ `
        <div class="cell-label" v-if="name">Cell: {{ name }}</div>
    `
};