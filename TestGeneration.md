# Generating the code for test cells

To generate code for test cells, we proceed along the same lines as for code cells, but with one key difference.
The code in test cells is able to access the state of a notebook after any previous code cell, and we need to explain to the  the AI how to access such states. 

To access the state of a variable x after a cell that has name (stored in cell.metadata["name"]) some_name, the code can use __state__some_name.x .  

This applies, crucially, also for the variables in the previous code cell; so when the text explanation mentions "this cell" or "the current cell", the code generated needs to access the variables prepending a __state__<name>. , where <name> is the name of the previous code cell.

So to generate the code for test cells, we need to pass to the code generation for tests all the usual arguments we pass for code generation, and also instructions on how to access variables after states, and also, the full list of previous state names (for code cells only). 

Can you update gemini.py, claude.py, plainbook.py, to reflect this change? 
