import re
import string

from google import genai
from google.genai import types

SPACES_AND_PUNCTUATION_PATTERN = f"^[{re.escape(string.punctuation + string.whitespace)}]+"

SYSTEM_INSTRUCTIONS = """
You are an assistant that writes Python code for Jupyter cells, and your task is to 
write the code for one Jupyter cell.
You are given specific instructions on what the new cell should do. 
To help write the code, you are also given the previous cells of the Jupyter notebook 
(in JSON format), along with their output (if any) and a description of the variables 
that are present after executing those cells.
Return ONLY the code, no markdown formatting or explanations.
To display Pandas dataframes, you can simply return the dataframe variable name,
and the notebook will render it appropriately.
"""

CHECKING_INSTRUCTIONS = """
You are an assistant that validates Python code for Jupyter cells. 
Your task is to check whether a Jupyter notebook cell does what it specified in its instructions. 
You are given the instructions, the code of the cell to verify, 
and you are also given all previous cells of the Jupyter notebook (in JSON format), 
including with their output (if any). 
You are also given a description of the variables that are present after executing those 
previous cells.
You should return the words YES (if the code meets the instructions) or NO (if it does not), 
followed by a brief explanation.
"""

def clean_start(text):
    return re.sub(SPACES_AND_PUNCTUATION_PATTERN, '', text)

def build_context_prompt(
    preceding=None,
    previous=None,
    file_context=None, 
    error_context=None,
    variable_context=None):
    prompt = f"""
CONTEXT (Existing Notebook Code):
{preceding}

""" 
    if previous:
        prompt += previous + "\n\n"
    if error_context:
        prompt += f"""
ERROR CONTEXT:
{error_context}

"""
    if file_context:
        prompt += f"""
FILE CONTEXT:
{file_context}

"""
    if variable_context:
        prompt += f"""
VARIABLE CONTEXT (Variables currently in memory):
{variable_context}

"""
    return prompt


def gemini_generate_code(
    api_key, 
    preceding_code=None,
    previous_code=None,
    instructions=None,
    file_context=None, 
    error_context=None,
    variable_context=None,
    debug=False):
    # 1. Initialize the Gemini client
    client = genai.Client(api_key=api_key)
    
    # 2. Create the prompt
    prompt = build_context_prompt(
        preceding=preceding_code,
        previous=previous_code,
        file_context=file_context,
        error_context=error_context,
        variable_context=variable_context)
    prompt += f"""    
INSTRUCTIONS for New Cell:
{instructions}

Code:
"""

    if debug:
        print("Prompt:", prompt)

    # 3. Generate content
    # Note: System instructions are now passed inside the config argument
    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTIONS
        )
    )
    if debug:
        print("Response:", response.text)
    # 4. Process the response
    # We need to strip the ```python ` and trailing ```
    # There is no simple way to get gemini not add this :-) 
    code = response.text
    if code.startswith("```python"):
        code = code[len("```python"):].strip()
    if code.endswith("```"):
        code = code[:-3].strip()
    # print("Generated Code:", code)
    return code

# Usage
# new_code = generate_notebook_cell(api_key, previous_code, "Plot a sine wave with numpy")


def gemini_validate_code(api_key, previous_code, code_to_validate, instructions, variable_context=None, debug=False):
    client = genai.Client(api_key=api_key)
    prompt = build_context_prompt(
        preceding=previous_code,
        variable_context=variable_context
    )
    prompt += f"""

CODE TO VALIDATE:
{code_to_validate}

INSTRUCTIONS for Validation:
{instructions}

Validation Result:
"""

    if debug:
        print("Prompt:", prompt)

    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=CHECKING_INSTRUCTIONS
        )   
    )
    if debug:
        print("Response:", response.text)
    r = response.text.strip()
    if r.upper().startswith("YES"):
        validation_result = dict(is_valid=True, message=clean_start(r[3:]))
    elif r.upper().startswith("NO"):
        validation_result = dict(is_valid=False, message=clean_start(r[2:]))
    else:
        validation_result = dict(is_valid=False, message=r)
    return validation_result
