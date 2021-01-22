import { useCallback, useState } from "react";
import { useRequest } from "./request.hook";

export const useForm = () => {
  const [form, setForm] = useState({});
  const { request, err, loading } = useRequest();

  const fieldChangeHandler = useCallback(
    (event) => {
      setForm(
        Object.assign(form, {
          [event.target.name]: event.target.files || event.target.value,
        })
      );
    },
    [form, setForm]
  );

  const getFormInMultipart = useCallback(() => {
    const formData = new FormData();
    for (const key of Object.keys(form)) {
      if (typeof form[key] === "object") {
        for (let i = 0; i < form[key].length; i++) {
          formData.append(key, form[key][i]);
        }
      } else {
        formData.append(key, form[key]);
      }
    }

    return formData;
  }, [form]);

  const addFieldToForm = useCallback(
    (name, value) => {
      setForm(
        Object.assign(form, {
          [name]: value,
        })
      );
    },
    [form, setForm]
  );

  const setFormManualy = useCallback(
    (state) => {
      setForm(Object.assign(form, state));
    },
    [form]
  );

  const formSubmitHandler = useCallback(
    async ({
      url,
      headers = { "Content-Type": "application/json" },
      method = "POST",
    }) => {
      try {
        let body = form;

        if (headers["Content-Type"] === "multipart/form-data") {
          body = getFormInMultipart();
          delete headers["Content-Type"];
        }

        const response = await request(url, { method, body, headers });
        return response;
      } catch (error) {}
    },
    [form, getFormInMultipart, request]
  );

  return [
    fieldChangeHandler,
    formSubmitHandler,
    setFormManualy,
    addFieldToForm,
    loading,
    err,
  ];
};
