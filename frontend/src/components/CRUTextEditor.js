/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Editor } from 'react-draft-wysiwyg';
import { convertFromRaw, convertToRaw } from 'draft-js';

const CRUTextEditor = ({
  control,
  registeredName,
  name,
  required = false,
  editable = true,
}) => {
  // const [focus, setFocus] = useState(false);

  return (
    <>
      <div>
        <p className="mb-1">{name}</p>
        <Controller
          rules={{ required: required ? `${name} harus diisi` : false }}
          control={control}
          name={registeredName}
          render={({ field, fieldState: { error } }) => (
            <>
              <Editor
                readOnly={!editable}
                toolbar={{
                  options: [
                    'inline',
                    'fontSize',
                    'list',
                    'textAlign',
                    'history',
                  ],
                }}
                // onFocus={() => {
                //   setFocus(true);
                // }}
                // onBlur={() => {
                //   setFocus(false);
                // }}
                editorState={field.value}
                onEditorStateChange={(res) => {
                  const convertToRawResult = convertToRaw(
                    res.getCurrentContent()
                  );

                  if (
                    (convertToRawResult.blocks.length === 1) &
                    (convertToRawResult.blocks[0].text === '')
                  ) {
                    field.onChange(null);
                  } else {
                    field.onChange(res);
                  }
                }}
                wrapperClassName="wrapper-class"
                editorClassName={`editor-class ${
                  error && 'border !border-primary-400 !border-t'
                } ${
                  !editable &&
                  '!border-t bg-grayDisabled-400 !border-grayDisabled-500 text-grayDisabled-600'
                }`}
                toolbarClassName={`toolbar-class ${!editable && '!hidden'}`}
              />
              {error && (
                <p className="mt-1 text-sm text-primary-400">{error.message}</p>
              )}
            </>
          )}
        />
      </div>
    </>
  );
};

export default CRUTextEditor;
