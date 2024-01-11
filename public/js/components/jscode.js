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
  if (type=="jscode" && element.getAttribute("onlyEditor")=="true")
  {

  // get script from the element
  const scriptTag = element.getElementsByTagName("script")[0];
  // set the code in code editor
  codeEditor.setValue(scriptTag.innerHTML);
  
  //set id of the div in the code editor

  showjsCodeEditor(element);
  }
}

function showjsCodeEditor(elementDIV) {
    const editor = document.getElementById('jsCodeDialog');
    if (elementDIV){
      editor.setAttribute("elementDIV",elementDIV.id);
    }
    else
    {
      editor.removeAttribute("elementDIV");
      codeEditor.setValue("");
      
    }
    if (editor) {
     editor.style.display='block';
    }
  }

  function hidejsCodeEditor() {
    const editor = document.getElementById('jsCodeDialog');
    if (editor) {
        editor.style.display='none';
        codeEditor.setValue("");

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
    const editor = document.getElementById('jsCodeDialog');
    elementDIV= editor.getAttribute("elementDIV");
    
    if (elementDIV===undefined || elementDIV===null )    {
        const formContainer = document.getElementById('formContainer');
        const divId = `jscode${Date.now()}`;
        const scriptTag = `<div id="${divId}" tagName="jscode" onlyEditor="true" class="editorElement"><b><.:JSCODE:.></b><script>${codeEditor.getValue()}</script></div>`;
        editor.setAttribute("elementDIV",divId);
        formContainer.innerHTML += scriptTag;
      // show toas message
      showToast("Code saved");
      }
    else
    {
      if (elementDIV.tagName!="jscode")
      {
        elementDIV.innerHTML="<b><.:JSCODE:.></b>"+codeEditor.getValue();
        showToast("Code updated");
      }
    }
  
  }