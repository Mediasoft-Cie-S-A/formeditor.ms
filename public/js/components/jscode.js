/*
 * Copyright (c) 2023 Mediasoft & Cie S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { Double } = require("mongodb");


function createJScode(type) {
    showjsCodeEditor();
}

function editJScode(type,element,content)
{
}

function showjsCodeEditor() {
    const editor = document.getElementById('jsCodeDialog');
    if (editor) {
     editor.style.display='block';
    }
  }

  function hidejsCodeEditor() {
    const editor = document.getElementById('jsCodeDialog');
    if (editor) {
        editor.style.display='none';
    }
  }

  function executejsCodeCode() {
    
    const procedureCode=codeEditor.getValue();
    console.log(procedureCode);

    try {
      const script = document.createElement('script');
      script.text = procedureCode;
      document.body.appendChild(script);
      document.body.removeChild(script);
    } catch (error) {
      console.error('Error in the entered code:', error);
    }
  }

  function savejsCodeCode() {

    const formContainer = document.getElementById('formContainer');
    const scriptTag = `<script>${codeEditor.getValue()}</script>`;
    formContainer.innerHTML += scriptTag;
    showtoast("Code saved");
    // You can also save it to localStorage or another storage method
  }