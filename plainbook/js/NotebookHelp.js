const NotebookHelp = {
    template: /* html */ `
        <div class="help-container p-5">
            <div class="content">
                <h1 class="title">Plainbook</h1>

                <p>A Plainbook is a document that contains a series of cells. 
                The cells describe in plain language what you want to do.  Your instructions are translated into code and executed.
                <strong>You need at least one AI key to use Plainbook</strong>, which you can set in the settings menu.</p>
                <p>There are two types of cells:</p>
                <ul>
                    <li><strong>Comment cells:</strong> Used for comments and explanations; you can use markdown notation.</li>
                    <li><strong>Action cells:</strong> Describe here in plain language what you want to do.  
                    Your instructions will be translated into code and executed.</li>
                </ul>

                <h2 class="title is-4">Working with Action Cells</h2>
                <ul>
                    <li><strong>Run:</strong> Click the play button to execute the notebook up to the current cell.  
                    Any missing code is generated before the cells are run.</li>
                    <li><strong>Regenerate Code:</strong> Ask AI to generate or fix code based on your description.</li>
                    <li><strong>Validate Code:</strong> Check if the generated code matches your description.</li>
                    <li><strong>Move:</strong> Use arrow buttons to reorder cells.</li>
                    <li><strong>Delete:</strong> Click the trash button to remove a cell</li>
                </ul>
                <p><strong>Execution order:</strong> Unlike in Jupyter Notebooks, cells are always guaranteed to be executed in order, starting from the beginning.
                If you click "Run" on a cell, all preceding cells will be executed first to ensure that the notebook 
                is always in a consistent state.</p>

                <h2 class="title is-4">Tips for Best Results</h2>
                <ul>
                    <li>Select all input/output files you plan to use using the file manager at the top.</li>
                    <li>Write clear, detailed descriptions of what you want the code to do.</li>
                    <li>If the generated code isn't right, update the description and regenerate.</li>
                </ul>
            </div>
        </div>
    `
};

export default NotebookHelp;
