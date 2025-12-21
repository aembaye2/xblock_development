markdown_data = 'A fruit is the fertilized ovary of a tree or plant and contains seeds. Given this, a ' \
                '[[(tomato), potato]] is consider a fruit, while a [[cucumber, (onion)]] is considered a vegetable. ' \
                'This text field should be filled with the correct answer ' \
                '[= the correct answer or= optional acceptable variant of the correct answer or= correct] ' \
                'and submitted.\n'

xml_data_default = """<inline_text_and_dropdown schema_version="1">
  <body>
    <p>A fruit is the fertilized ovary of a tree or plant and contains seeds. Given this, a <input_ref input="i1"/> is consider a fruit, while a <input_ref input="i2"/> is considered a vegetable. This text field should be filled with the correct answer <input_ref input="i3"/> and submitted.</p>
  </body>
  <optionresponse>
    <optioninput id="i1">
      <option correct="True">tomato</option>
      <option correct="False">potato</option>
    </optioninput>
  </optionresponse>
  <optionresponse>
    <optioninput id="i2">
      <option correct="False">cucumber</option>
      <option correct="True">onion</option>
    </optioninput>
  </optionresponse>
  <stringresponse answer="the correct answer" id="i3">
    <additional_answer answer="optional acceptable variant of the correct answer"/>
    <additional_answer answer="correct"/>
  </stringresponse>
</inline_text_and_dropdown>
"""

problem_inputs = {
    '<input_ref input="i2"/>': '[[cucumber, (onion)]]',
    '<input_ref input="i3"/>': '[= the correct answer or= optional acceptable variant of the correct answer or= correct]',
    '<input_ref input="i1"/>': '[[(tomato), potato]]',
    '<input_ref input="i4"/>': '[[(banana), apple]]'
}

xml_data_with_added_dropdown = """<inline_text_and_dropdown schema_version="1">
  <body/>
  <optionresponse>
    <optioninput id="i1">
      <option correct="True">tomato</option>
      <option correct="False">potato</option>
    </optioninput>
  </optionresponse>
  <optionresponse>
    <optioninput id="i2">
      <option correct="False">cucumber</option>
      <option correct="True">onion</option>
    </optioninput>
  </optionresponse>
  <stringresponse answer="the correct answer" id="i3">
    <additional_answer answer="optional acceptable variant of the correct answer"/>
    <additional_answer answer="correct"/>
  </stringresponse>
  <optionresponse>
    <optioninput id="i4">
      <option correct="True">banana</option>
      <option correct="False">apple</option>
    </optioninput>
  </optionresponse>
</inline_text_and_dropdown>
"""

problem_ids = {
    '<input_ref input="i1"/>': 'i1',
    '<input_ref input="i2"/>': 'i2',
    '<input_ref input="i4"/>': 'i4',
    '<input_ref input="i3"/>': 'i3'
}

prepared_markdown_with_hint = 'A fruit is the fertilized ovary of a tree or plant and contains seeds. ' \
                                   'Given this, a <input_ref input="i1"/> is consider a fruit, while a ' \
                                   '<input_ref input="i2"/> is considered a vegetable. This text field should be ' \
                                   'filled with the correct answer <input_ref input="i3"/> and submitted. ' \
                                   '<input_ref input="i4"/>\n\n[demandhint]Demand hint[demandhint]\n'

prepared_markdown_with_multiple_p_tags_and_hint = 'A fruit is the fertilized ovary of a tree or plant and contains ' \
                                   'seeds. Given this, a <input_ref input="i1"/> is consider a fruit, while a ' \
                                   '<input_ref input="i2"/> is considered a vegetable. This text field should be ' \
                                   'filled with the correct answer <input_ref input="i3"/> and submitted. ' \
                                   '<input_ref input="i4"/>\nOne more dropdown <input_ref input="i5"/> and ' \
                                   'text input <input_ref input="i6"/>\n\n[demandhint]Demand hint[demandhint]\n'

separated_body = [
    'A fruit is the fertilized ovary of a tree or plant and contains seeds. Given this, '
    'a <input_ref input="i1"/> is consider a fruit, while a <input_ref input="i2"/> is considered '
    'a vegetable. This text field should be filled with the correct answer <input_ref input="i3"/> '
    'and submitted. <input_ref input="i4"/>',
    ''
]

separated_body_with_multiple_p_tags = [
    'A fruit is the fertilized ovary of a tree or plant and contains seeds. Given this, '
    'a <input_ref input="i1"/> is consider a fruit, while a <input_ref input="i2"/> is considered '
    'a vegetable. This text field should be filled with the correct answer <input_ref input="i3"/> '
    'and submitted. <input_ref input="i4"/>',
    'One more dropdown <input_ref input="i5"/> and text input <input_ref input="i6"/>',
    ''
]

xml_body_single_p_tag = '<body>\n  <p>A fruit is the fertilized ovary of a tree or plant and contains seeds. ' \
                        'Given this, a <input_ref input="i1"/> is consider a fruit, while a <input_ref input="i2"/> ' \
                        'is considered a vegetable. This text field should be filled with the correct answer ' \
                        '<input_ref input="i3"/> and submitted. <input_ref input="i4"/></p>\n  <br/>\n</body>\n'

xml_body_multiple_p_tags = '<body>\n  <p>A fruit is the fertilized ovary of a tree or plant and contains seeds. ' \
                           'Given this, a <input_ref input="i1"/> is consider a fruit, while a ' \
                           '<input_ref input="i2"/> is considered a vegetable. This text field should be filled ' \
                           'with the correct answer <input_ref input="i3"/> and submitted. ' \
                           '<input_ref input="i4"/></p>\n  <p>One more dropdown </p>\n  <br/>\n</body>\n'

demand_hints = ['[demandhint]Demand hint[demandhint]']

xml_root_with_demandhint = """<inline_text_and_dropdown schema_version="1">
  <body/>
  <demandhint>
    <hint>Demand hint</hint>
    <hint>New added hint</hint>
  </demandhint>
</inline_text_and_dropdown>
"""

prepared_dropdown_data = {
    'i1': '[[(tomato), potato]]',
    'i2': '[[cucumber, (onion)]]'
}

prepared_input_text_data = {
    'i3': '[= the correct answer or= optional acceptable variant of the correct answer or= correct]'
}

prepared_input_fields = {
    'i1': '[[(tomato), potato]]',
    'i2': '[[cucumber, (onion)]]',
    'i3': '[= the correct answer or= optional acceptable variant of the correct answer or= correct]'
}

p_tag = '<p>A fruit is the fertilized ovary of a tree or plant and contains seeds. Given this, a ' \
        '<input_ref input="i1"/> is consider a fruit, while a <input_ref input="i2"/> is considered a vegetable. ' \
        'This text field should be filled with the correct answer <input_ref input="i3"/> and submitted. ' \
        '<input_ref input="i4"/></p>\n    \n'

p_string_tag = 'A fruit is the fertilized ovary of a tree or plant and contains seeds. Given this, a ' \
                 '[[(tomato), potato]] is consider a fruit, while a [[cucumber, (onion)]] is considered a vegetable. ' \
                 'This text field should be filled with the correct answer [= the correct answer or= optional ' \
                 'acceptable variant of the correct answer or= correct] and submitted.\n'

prepared_body = [
    'A fruit is the fertilized ovary of a tree or plant and contains seeds. Given this, a [[(tomato), potato]] '
    'is consider a fruit, while a [[cucumber, (onion)]] is considered a vegetable. This text field should be filled '
    'with the correct answer [= the correct answer or= optional acceptable variant of the correct answer or= correct] '
    'and submitted.\n'
]

prepared_demand_hints = [
    '[demandhint]Demand hint[demandhint]',
    '\n',
    '[demandhint]New added hint[demandhint]',
    '\n'
]

options_for_shuffle = ('banana', 'apple', 'pear', 'pineapple')

xml_data_expanded = """<inline_text_and_dropdown schema_version="1">
  <body>
    <p>A fruit is the fertilized ovary of a tree or plant and contains seeds. Given this, a <input_ref input="i1"/> is consider a fruit. This text field should be filled with the correct answer <input_ref input="i2"/> and submitted.</p>
  </body>
  <optionresponse>
    <optioninput id="i1">
      <option correct="True">tomato</option>
      <option correct="False">potato</option>
      <option correct="False">carrot</option>
    </optioninput>
  </optionresponse>
  <stringresponse answer="the correct answer" id="i2">
    <additional_answer answer="optional acceptable variant of the correct answer"/>
    <additional_answer answer="correct"/>
  </stringresponse>
</inline_text_and_dropdown>
"""

options_string_data = '<option>tomato</option><option>potato</option><option>carrot</option>'

options_string_data_randomized = '<option>carrot</option><option>potato</option><option>tomato</option>'
