import google.generativeai as genai
import json

def generate_notebook_cell(notebook_json, instructions):
    # 1. Configure the API
    genai.configure(api_key="YOUR_GEMINI_API_KEY")
    
    # 2. Extract existing code for context
    # This helps Gemini know about previously defined variables/imports
    nb = json.loads(notebook_json)
    existing_code = "\n".join([
        cell['source'] for cell in nb['cells'] 
        if cell['cell_type'] == 'code'
    ])

    # 3. Initialize the model with a System Instruction
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash", # or gemini-1.5-pro for complex logic
        system_instruction="You are an assistant that writes Python code for Jupyter cells. "
                           "Return ONLY the code, no markdown formatting or explanations."
    )

    # 4. Create the prompt
    prompt = f"""
    CONTEXT (Existing Notebook Code):
    {existing_code}

    INSTRUCTIONS for New Cell:
    {instructions}
    
    Code:
    """

    response = model.generate_content(prompt)
    return response.text

# Usage
# instructions = "Create a plot using matplotlib showing the trend of the 'price' variable."
# new_code = generate_notebook_cell(notebook_content, instructions)