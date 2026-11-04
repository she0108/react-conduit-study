# Conduit 시작 템플릿

Vite + React 템플릿에 모의 API를 더한 시작점입니다. 라우팅, Markdown 표시, 화면은 여기서부터 직접 만들어 봅니다.

UI는 [RealWorld](https://github.com/realworld-apps/realworld) 프로젝트의 [Conduit 데모](https://demo.realworld.show/)를 참고했습니다.

| 브랜치                 | 내용                                        |
| ---------------------- | ------------------------------------------- |
| `main`                 | 시작점                                      |
| `react-only`           | 상태, 조회, 폼을 직접 구현한 완성본         |
| `react-with-libraries` | 상태, 조회, 폼을 라이브러리로 구현한 완성본 |

## 만들 기능

- 글 목록: 전체 피드, 태그별 보기, 페이지 이동, 인기 태그
- 글 상세: Markdown 본문, 좋아요, 작성자 팔로우
- 글 작성·수정·삭제
- 댓글 조회·작성·삭제
- 로그인, 회원가입, 프로필, 설정

화면은 [Conduit 데모](https://demo.realworld.show/)에서 미리 볼 수 있습니다.

## 시작 방법

둘 중 하나를 고릅니다.

- **이 템플릿으로 시작:** 이 레포를 Fork한 뒤 내 레포를 클론합니다. 원본 레포에는 푸시할 수 없으므로, 작업을 GitHub에 올리려면 Fork가 필요합니다.
- **직접 세팅:** 새 Vite 프로젝트에 MSW를 설치하고, 이 레포의 `src/mocks/` 폴더를 복사합니다. 그다음 `src/main.jsx`를 이 레포처럼 수정해 모의 API를 먼저 시작합니다.

```sh
npm install -D msw
npx msw init public --save
```

라우팅과 Markdown 표시에 필요한 패키지는 직접 골라 설치합니다. 완성본은 `react-router`와 `react-markdown`을 사용합니다. 폼, 인증 상태, 서버 데이터에 라이브러리를 쓸지도 자유롭게 정합니다.

## 완성본 참고하기

막히는 부분이 있으면 원하는 브랜치를 참고합니다. GitHub 페이지의 브랜치 선택 메뉴에서 코드만 볼 수도 있고, GitHub Desktop의 **Current Branch**로 브랜치를 바꿔 실행할 수도 있습니다.

브랜치마다 패키지가 다르므로, 브랜치를 바꿔 실행할 때는 먼저 `npm install`을 다시 실행합니다.

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
