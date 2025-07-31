import { useRef } from "react";

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

export function useGooglePicker() {
  const pickerLoaded = useRef(false);
  const DEVELOPER_KEY = "AIzaSyD8ItqZQ9Ayjs9QBCgnJ2tcdsl8HMBvC-I";

  const loadPickerScript = () => {
    if (pickerLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      pickerLoaded.current = true;
    };
    document.body.appendChild(script);
  };

  const openPicker = async (onPick: (url: string) => void) => {
    try {
      loadPickerScript();
      // Aguarda o carregamento do script
      const waitForGapi = () =>
        new Promise<void>((resolve) => {
          const check: () => void = () => {
            if (window.gapi) resolve();
            else setTimeout(check, 100);
          };
          check();
        });
      await waitForGapi();

      window.gapi.load("client:auth2:picker", async () => {
        try {
          await window.gapi.client.init({
            apiKey: DEVELOPER_KEY,
            clientId: "142602582379-s801eq1tj0flior7biftvspfgi6pj2ht.apps.googleusercontent.com",
            scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly",
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
          });

          const authInstance = window.gapi.auth2.getAuthInstance();
          let user = authInstance.currentUser.get();
          if (!user.isSignedIn()) {
            await authInstance.signIn();
            user = authInstance.currentUser.get();
          }
          const oauthToken = user.getAuthResponse().access_token;

          if (window.google && window.google.picker) {
            const pickerApi = window.google.picker as NonNullable<typeof window.google.picker>;
            const view = new pickerApi.DocsView(pickerApi.ViewId.DOCS_IMAGES)
              .setIncludeFolders(true)
              .setSelectFolderEnabled(false);

            const picker = new pickerApi.PickerBuilder()
              .addView(view)
              .setOAuthToken(oauthToken)
              .setDeveloperKey(DEVELOPER_KEY)
              .setCallback((data: any) => {
                if (data.action === pickerApi.Action.PICKED) {
                  const file = data.docs[0];
                  onPick(file.url);
                }
              })
              .build();
            picker.setVisible(true);
          } else {
            alert("Google Picker não foi carregado corretamente. Tente novamente.");
          }
        } catch (err) {
          console.error("Erro interno do Picker:", err);
          alert("Erro ao abrir o Google Picker. Veja o console para detalhes.");
        }
      });
    } catch (err) {
      console.error("Erro ao carregar Picker:", err);
      alert("Erro ao carregar o Google Picker. Veja o console para detalhes.");
    }
  };

  return { openPicker };
}
