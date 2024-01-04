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
    const jsCode = document.getElementById('jsCode').value;
    try {
      const script = document.createElement('script');
      script.text = jsCode;
      document.body.appendChild(script);
    } catch (error) {
      console.error('Error in the entered code:', error);
    }
  }

  function savejsCodeCode() {
    const jsCode = document.getElementById('jsCode').value;
    const scriptTag = `<script>${jsCode}</script>`;
    document.body.innerHTML += scriptTag;
    // You can also save it to localStorage or another storage method
  }