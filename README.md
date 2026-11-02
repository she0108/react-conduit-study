# Conduit 시작 템플릿

Vite + React 템플릿에 [MSW](https://mswjs.io)로 만든 RealWorld 모의 API를 더한 시작점입니다. 별도 서버 없이 `npm install`과 `npm run dev`만으로 실행합니다. MSW 3에 맞춰 Node.js 22.12 이상이 필요합니다.

## 모의 API

앱에서 `/api`로 요청하면 브라우저의 서비스 워커가 응답합니다. 응답 형식과 상태 코드는 [RealWorld 공식 API 계약](https://github.com/realworld-apps/realworld/blob/main/specs/api/openapi.yml)을 따릅니다. 인증이 필요한 요청에는 `Authorization: Token <token>` 헤더를 보냅니다.

| 영역   | 요청                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 인증   | `POST /api/users`, `POST /api/users/login`, `GET·PUT /api/user`                                                                      |
| 글     | `GET·POST /api/articles`, `GET /api/articles/feed`, `GET·PUT·DELETE /api/articles/:slug`, `POST·DELETE /api/articles/:slug/favorite` |
| 댓글   | `GET·POST /api/articles/:slug/comments`, `DELETE /api/articles/:slug/comments/:id`                                                   |
| 프로필 | `GET /api/profiles/:username`, `POST·DELETE /api/profiles/:username/follow`                                                          |
| 태그   | `GET /api/tags`                                                                                                                      |

바로 로그인할 수 있는 데모 계정은 `demo@conduit.test` / `password123`입니다.

데이터는 브라우저의 localStorage에 저장되어 새로고침해도 유지되며, 다른 브라우저나 사용자와 공유되지 않습니다. 처음 데이터로 되돌리려면 개발자 도구 콘솔에서 `localStorage.removeItem("conduit-mock-db")`를 실행하고 새로고침합니다.

핸들러는 `src/mocks/handlers.js`, 초기 데이터는 `src/mocks/db.js`에 있습니다. `public/mockServiceWorker.js`는 MSW가 생성한 파일이므로 수정하지 않습니다. 배포할 때도 모의 API로 동작합니다.
