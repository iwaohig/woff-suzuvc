document.addEventListener("DOMContentLoaded", function() {
    initializeWoffApp();
});

function initializeWoffApp() {
    // WOFF_IDは外部のHTMLファイルで定義されていると仮定
    if (typeof WOFF_ID === 'undefined') {
        console.error('WOFF_ID is not defined.');
        return;
    }

    woff.init({ woffId: WOFF_ID })
        .then(() => {
            if (!woff.isInClient() && !woff.isLoggedIn()) {
                console.log("ログインを促します。");
                woff.login().catch(err => {
                    console.error("ログインプロセス中にエラーが発生しました:", err);
                });
            } else {
                getProfileAndFillForm();
                // プロファイル情報の取得後、アクセストークンも取得してフォームに設定
                getAccessTokenAndSetToForm();
            }
        })
        .catch(err => {
            console.error("WOFF SDKの初期化に失敗しました:", err);
        });
}

function getProfileAndFillForm() {
    woff.getProfile()
        .then(profile => {
            document.getElementById("displayNameInput").value = profile.displayName;
            document.getElementById("userIdInput").value = profile.userId;
        })
        .catch(err => {
            console.error("プロファイル情報の取得に失敗しました:", err);
        });
}

// 新たにアクセストークンを取得してフォームに設定する関数
function getAccessTokenAndSetToForm() {
    woff.getAccessToken()
        .then(token => {
            // アクセストークンをフォームに設定するための隠しフィールドを作成
            const tokenField = document.createElement('input');
            tokenField.setAttribute('type', 'hidden');
            tokenField.setAttribute('name', 'accessToken');
            tokenField.setAttribute('value', token);
            // フォームに隠しフィールドを追加
            document.getElementById("myForm").appendChild(tokenField);
        })
        .catch(err => {
            console.error("アクセストークンの取得に失敗しました:", err);
        });
}

function submitForm() {
    // フォーム要素の取得
    const formElement = document.getElementById("myForm");
    // FormDataオブジェクトの作成
    const formData = new FormData(formElement);

    // フォームデータをJSONに変換
    const object = {};
    formData.forEach((value, key) => object[key] = value);
    const json = JSON.stringify(object);

    fetch('https://prod-29.japaneast.logic.azure.com:443/workflows/aaaccedf9ba34275bd6617242c212bf0/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2t-RAIoeztyj2b7Lcsw_WTzCawFgoscpHj2nO9aMqWc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: json
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Form data sent successfully');
        woff.closeWindow();
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}
