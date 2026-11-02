# Conduit 시작 템플릿

Vite + React 템플릿에 모의 API를 더한 시작점입니다. 라우팅, Markdown 표시, 화면은 여기서부터 직접 만들어 봅니다.

| 브랜치                 | 내용                                        |
| ---------------------- | ------------------------------------------- |
| `main`                 | 시작점                                      |
| `react-only`           | 상태, 조회, 폼을 직접 구현한 완성본         |
| `react-with-libraries` | 상태, 조회, 폼을 라이브러리로 구현한 완성본 |

## 실행

Node.js 22.12 이상이 필요합니다.

```sh
npm install
npm run dev
```

## 모의 API

서버 없이 [MSW](https://mswjs.io)가 브라우저에서 `/api` 요청에 응답합니다. 응답 형식은 [RealWorld API 계약](https://github.com/realworld-apps/realworld/blob/main/specs/api/openapi.yml)을 따르고, 코드는 `src/mocks/`에 있습니다.

- 데모 계정: `demo@conduit.test` / `password123`
- 데이터는 이 브라우저의 localStorage에만 저장됩니다. 비밀번호도 암호화 없이 저장되니 **실제 비밀번호를 쓰지 마세요.**
- 처음 데이터로 되돌리기: 콘솔에서 `localStorage.removeItem("conduit-mock-db")` 실행 후 새로고침

| 영역   | 요청                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 인증   | `POST /api/users`, `POST /api/users/login`, `GET·PUT /api/user`                                                                      |
| 글     | `GET·POST /api/articles`, `GET /api/articles/feed`, `GET·PUT·DELETE /api/articles/:slug`, `POST·DELETE /api/articles/:slug/favorite` |
| 댓글   | `GET·POST /api/articles/:slug/comments`, `DELETE /api/articles/:slug/comments/:id`                                                   |
| 프로필 | `GET /api/profiles/:username`, `POST·DELETE /api/profiles/:username/follow`                                                          |
| 태그   | `GET /api/tags`                                                                                                                      |
