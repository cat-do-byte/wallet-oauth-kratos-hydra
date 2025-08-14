# 🧾 Wallet + OAuth Authorization Flow (Hydra + Kratos)

This project contains a set of microservices that work together to enable secure authentication and OAuth-based authorization using **Ory Kratos** as the Identity Provider (IDP) and **Ory Hydra** as the OAuth 2.0 Authorization Server.

---

## 🧱 Services

| Service                     | Port | Description                                             |
| --------------------------- | ---- | ------------------------------------------------------- |
| `kratos-manage-svc`         | N/A  | Management API for Kratos (account management)          |
| `kratos-selfservice-ui-svc` | 4455 | Kratos UI (login/register interface)                    |
| `hydra-manage-svc`          | 4433 | Hydra admin & public endpoints                          |
| `oauth-app-management-svc`  | N/A  | Shop admin uses this to register OAuth clients in Hydra |
| `shop-svc`                  | 3050 | E-commerce frontend; integrates Wallet via OAuth        |
| `wallet-svc`                | 3000 | Wallet service (user balances, payments, etc.)          |

---

## 🔐 Authentication & Authorization Flow

### ✅ 1. **User Registration & Login**

- Users create and manage their accounts via **Kratos UI** (`kratos-selfservice-ui-svc`).
- Kratos issues an **authenticated session** with a cookie (`ory_kratos_session`).
- This session is valid across:
  - `kratos-selfservice-ui-svc`
  - `wallet-svc` _(shared domain for cookie access)_

> ⚠️ **Important**: Users **must log in through Kratos UI first** before accessing `wallet-svc`. Otherwise, the wallet will not recognize the session.

---

### 🛒 2. **OAuth Integration with Shop**

- The shop admin creates an **OAuth client** using `oauth-app-management-svc` (which wraps calls to Hydra’s admin API).
- The client has scopes like: `wallet:read`, `wallet:transfer`, etc.

---

### 🔁 3. **User Authorizes Shop to Access Wallet**

1. **User is logged in** via Kratos.
2. **User visits** `shop-svc` to access wallet functionality.
3. Shop triggers the **OAuth authorization flow** via Hydra:
   ```
   GET /oauth2/auth?client_id=shop-client&scope=wallet:read&redirect_uri=...
   ```
4. Hydra uses **Kratos as its IDP**:
   - Redirects user to Kratos login (if not already logged in).
   - After login, user is asked to **grant consent** for the requested scopes.
5. On approval:
   - Hydra issues **access and refresh tokens** to `shop-svc`.

---

### 🔑 4. **Shop Calls Wallet API with Token**

- `shop-svc` stores and uses the access token to call secured endpoints on `wallet-svc`.
- `wallet-svc` verifies the token using Hydra's introspection endpoint or JWKS (based on configuration).
- If the token is valid and has the required scopes, the request is processed.

---

## ⚙️ Technologies Used

| Component    | Technology                               |
| ------------ | ---------------------------------------- |
| IDP          | [Ory Kratos](https://www.ory.sh/kratos/) |
| OAuth Server | [Ory Hydra](https://www.ory.sh/hydra/)   |
| UI Frontend  | Kratos Self-Service UI                   |
| API Services | Node.js / Express (assumed)              |
| Token Type   | OAuth2 Bearer Tokens                     |
| Auth Flow    | Authorization Code Flow with Consent     |

---

## 🌐 Cookie Sharing Note

To allow the Kratos session cookie to be used by `wallet-svc`, ensure the following:

- `kratos-selfservice-ui-svc` and `wallet-svc` are hosted under the **same domain** (e.g., `myapp.com`).
- Cookies must be set with:
  - `Domain=yourdomain.com`
  - `SameSite=None`
  - `Secure=true` (for HTTPS)

---

## 🧪 Testing the Flow (Manual)

1. **Start Kratos UI** (`http://localhost:4455`) and login.
2. Open `wallet-svc` (`http://localhost:3000`) → session should be valid.
3. Go to `shop-svc` (`http://localhost:3050`) → click "Connect Wallet".
4. You’ll be redirected through Hydra OAuth flow.
5. Approve consent.
6. Token is issued and stored by `shop-svc`.
7. Shop makes API call to Wallet with token.

---

## 🧰 Useful Endpoints

| Description   | URL                                 |
| ------------- | ----------------------------------- |
| Kratos UI     | `http://localhost:4455/`            |
| Wallet API    | `http://localhost:3000/`            |
| Shop Frontend | `http://localhost:3050/`            |
| Hydra Public  | `http://localhost:4433/`            |
| Hydra Admin   | `http://localhost:4445/` (optional) |

---

## 🛠️ Future Improvements

- [ ] Add refresh token handling in `shop-svc`
- [ ] Enable PKCE for public clients
- [ ] Central logging of auth events
- [ ] Per-scope permission management in `wallet-svc`

---

## 📂 Repo Structure (Suggestion)

```bash
/
├── hydra-manage-svc/
├── kratos-manage-svc/
├── kratos-selfservice-ui-svc/
├── oauth-app-management-svc/
├── shop-svc/
└── wallet-svc/
```
