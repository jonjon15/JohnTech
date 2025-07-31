import { useRef } from "react";

declare global {
  interface Window {
    gapi?: any;
    google?: any;
    googleIdentityOAuthToken?: string;
  }
}

export function useGooglePicker() {
  const pickerLoaded = useRef(false);
  const gisLoaded = useRef(false);
  const DEVELOPER_KEY = "AIzaSyD8ItqZQ9Ayjs9QBCgnJ2tcdsl8HMBvC-I";
  const CLIENT_ID = "142602582379-s801eq1tj0flior7biftvspfgi6pj2ht.apps.googleusercontent.com";
  const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly";

  // Carrega o script do Google Identity Services (GIS)
  const loadGisScript = () => {
    if (gisLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      gisLoaded.current = true;
    };
    document.body.appendChild(script);
  };

  const loadPickerScript = () => {
    if (pickerLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      pickerLoaded.current = true;
    };
    document.body.appendChild(script);
  };

  // Autenticação GIS moderna
  const authenticateWithGIS = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      loadGisScript();
      const check = () => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse: any) => {
              if (tokenResponse && tokenResponse.access_token) {
                resolve(tokenResponse.access_token);
              } else {
                reject("Falha ao obter token do Google Identity Services");
              }
            },
          }).requestAccessToken();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  };

  // Carrega o Picker e abre com o token GIS
  const openPicker = async (onPick: (url: string) => void) => {
    loadPickerScript();
    const oauthToken = await authenticateWithGIS();
    // Aguarda o carregamento do Picker
    const waitForPicker = () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if (window.google && window.google.picker) resolve();
          else setTimeout(check, 100);
        };
        check();
      });
    await waitForPicker();

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
  };

  return { openPicker };
}
