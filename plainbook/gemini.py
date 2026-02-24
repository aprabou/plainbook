from google import genai
from google.genai import types

from .ai_common import (
    SYSTEM_INSTRUCTIONS,
    CHECKING_INSTRUCTIONS,
    NAME_GENERATION_INSTRUCTIONS,
    build_context_prompt,
    build_name_prompt,
    parse_validation_response,
    strip_markdown_code_fences,
)


GEMINI_GENERATE_MODEL = "gemini-2.5-flash"
GEMINI_VALIDATE_MODEL = "gemini-2.5-flash"


def gemini_generate_code(
    api_key,
    preceding_code=None,
    previous_code=None,
    instructions=None,
    file_context=None,
    error_context=None,
    variable_context=None,
    validation_context=None,
    model=None,
    debug=False):
    # 1. Initialize the Gemini client
    client = genai.Client(api_key=api_key)
    model = model or GEMINI_GENERATE_MODEL

    # 2. Create the prompt
    prompt = build_context_prompt(
        preceding=preceding_code,
        previous=previous_code,
        file_context=file_context,
        error_context=error_context,
        variable_context=variable_context,
        validation_context=validation_context)
    prompt += f"""
INSTRUCTIONS for New Cell:
{instructions}

Code:
"""

    if debug and False:  # Don't print the prompt for generation by default since it can be very long
        print("Prompt:", prompt)

    # 3. Generate content
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTIONS
        )
    )
    if debug:
        print("Response:", response.text)
    # 4. Process the response
    code = strip_markdown_code_fences(response.text)
    return code


def gemini_validate_code(api_key, previous_code, code_to_validate, instructions, variable_context=None, model=None, debug=False):
    client = genai.Client(api_key=api_key)
    model = model or GEMINI_VALIDATE_MODEL

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

    if debug and False:  # Don't print the prompt for validation by default since it can be very long
        print("Prompt:", prompt)

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=CHECKING_INSTRUCTIONS
        )
    )
    if debug:
        print("Response:", response.text)
    return parse_validation_response(response.text)


def gemini_generate_cell_name(api_key, explanation, model=None, debug=False):
    client = genai.Client(api_key=api_key)
    model = model or GEMINI_GENERATE_MODEL
    prompt = build_name_prompt(explanation)
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=NAME_GENERATION_INSTRUCTIONS,
            max_output_tokens=50,
        ),
    )
    if debug:
        print("Response to name generation:", response.text)
    return response.text.strip()
