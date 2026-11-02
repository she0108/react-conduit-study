# Conduit React 참고 예제

props·state·effect를 배운 뒤 실제 기능의 연결을 찾아 읽는 JavaScript·JSX 예제입니다. `react-only` 브랜치와 화면·API는 같고, 인증 상태와 서버 데이터, 폼을 라이브러리로 옮긴 버전입니다. 이 구조가 유일한 정답은 아닙니다.

| 영역        | `react-only`                      | 이 브랜치           |
| ----------- | --------------------------------- | ------------------- |
| 폼          | `useState`, 직접 검증             | React Hook Form     |
| 인증        | Context, localStorage 직접 접근   | Zustand + `persist` |
| 서버 데이터 | `useEffect`, `useState`, `ignore` | TanStack Query      |

`git diff react-only..react-with-libraries`로 전체 차이를, 커밋 이력으로 라이브러리별 변경을 볼 수 있습니다.

## 실행

```sh
npm install
npm run dev
```

Node.js 22.12 이상이 필요합니다. Vite가 표시한 주소로 접속합니다. 별도 서버 없이 MSW 모의 API로 동작합니다.

```sh
npm run lint
npm run format:check
npm run build
npm run preview
```

`npm run format`은 코드 포맷을 정리합니다. 자동 테스트 파일·라이브러리·스크립트는 두지 않습니다.

## 화면과 진입 파일

| URL                            | 파일                                | 주요 기능                                     |
| ------------------------------ | ----------------------------------- | --------------------------------------------- |
| `/`                            | `src/pages/HomePage.jsx`            | 전체·개인 피드, 태그, 페이지네이션            |
| `/login`, `/register`          | `LoginPage.jsx`, `RegisterPage.jsx` | 로그인·가입, 보호 경로 복귀                   |
| `/article/:slug`               | `ArticlePage.jsx`                   | Markdown, 좋아요, 팔로우, 댓글, 본인 글 삭제  |
| `/editor`, `/editor/:slug`     | `EditorPage.jsx`                    | React Hook Form, 태그, 작성·수정, 작성자 확인 |
| `/profile/:username`           | `ProfilePage.jsx`                   | 프로필·작성한 글                              |
| `/profile/:username/favorites` | `ProfilePage.jsx`                   | 좋아요한 글·해제 후 목록 갱신                 |
| `/settings`                    | `SettingsPage.jsx`                  | 프로필·이메일·비밀번호 설정, 로그아웃         |

에디터와 설정은 로그인 후 접근합니다. 글 수정은 작성자를 추가로 확인합니다. 실제 변경 권한은 서버에서도 검사합니다.

## 코드를 읽는 순서

- `src/apis/`: 공통 HTTP 처리와 각 엔드포인트. `client.js`는 응답과 서버 오류를 처리하며 React를 import하지 않습니다.
- `src/stores/authStore.js`: 토큰과 로그아웃 (Zustand).
- `src/queryClient.js`, `src/hooks/useCurrentUser.js`: 쿼리 설정, 전역 401 처리, 현재 사용자.
- `src/hooks/useArticles.js`: URL 조건과 인증 변화에 따른 목록 조회.
- `src/pages/`: URL 해석, 페이지 데이터와 폼 상태.
- `src/components/`: 역할별 폴더로 나눈 컴포넌트. `layout`(공통 틀과 접근 제어), `article`, `comment`, `user`, `common`(도메인과 무관한 UI).
- `src/utils/`: 날짜 표시, 페이지 값 보정, 폼 검증 규칙.
- `src/mocks/`: MSW 모의 API의 핸들러와 초기 데이터.
- `src/styles/global.css`: 공통 기본 요소·변수. 각 화면·컴포넌트 스타일은 인접한 CSS Modules에 둡니다.

읽기 흐름은 `URL → useQuery(키) → API → fetch → 쿼리 캐시 → UI`입니다. 쓰기는 `useMutation`으로 요청하고 성공 응답을 캐시에 넣거나 관련 쿼리를 무효화합니다. 쿼리 키에 토큰을 넣어 로그아웃 뒤 이전 사용자의 좋아요·팔로우 값이 재사용되지 않게 합니다. 다시 방문한 화면은 캐시를 먼저 보여 주고 뒤에서 갱신하므로 `react-only`와 체감이 다릅니다.

| 학습 개념 | 찾아볼 코드                                                 |
| --------- | ----------------------------------------------------------- |
| props     | `ArticleCard.jsx`의 article                                 |
| 폼        | `LoginPage.jsx`의 `useForm`, `register`, `handleSubmit`     |
| 서버 조회 | `useArticles.js`의 `useQuery`와 쿼리 키                     |
| 서버 변경 | `FavoriteButton.jsx`의 `useMutation`과 무효화               |
| 전역 상태 | `authStore.js` → `useAuthStore` selector → `useCurrentUser` |
| URL 상태  | HomePage·ProfilePage의 search params와 페이지 링크          |

## API와 인증

[MSW](https://mswjs.io)로 만든 모의 API를 사용합니다. 응답 형식과 상태 코드는 [RealWorld 공식 API 계약](https://github.com/realworld-apps/realworld/blob/main/specs/api/openapi.yml)을 따릅니다. 데모 계정은 `demo@conduit.test` / `password123`입니다.

데이터는 브라우저의 localStorage에 저장되어 새로고침해도 유지되고, 다른 브라우저나 사용자와 공유되지 않습니다. 처음 데이터로 되돌리려면 콘솔에서 `localStorage.removeItem("conduit-mock-db")`를 실행하고 새로고침합니다.

토큰만 Zustand `persist`로 localStorage에 저장하고, 시작할 때 `/user`로 사용자를 복원합니다. 401이면 토큰을 지우고, 일시적인 연결·서버 오류면 토큰을 유지한 채 오류 화면과 다시 시도 버튼을 보여 줍니다. 비밀번호·사용자 객체 전체는 저장하지 않습니다. 이 토큰 저장 방식은 학습용 API 계약에 따른 선택입니다.

이 예제는 첫 React 프로젝트에서 핵심 흐름을 따라가기 쉽도록 범위를 줄였습니다. 멀티탭 동기화, 자동 재인증, 요청 취소, 조회 재시도 버튼, 범위를 벗어난 페이지 이동은 넣지 않았습니다. 로그인이 만료되면 로그아웃되며 작성 중인 내용은 유지되지 않습니다. 조회에 실패하면 브라우저를 새로고침합니다.

입력 오류는 서버의 필드별 오류와 함께 표시합니다. Markdown은 raw HTML 플러그인 없이 렌더링합니다. 프로필 이미지는 URL 입력 방식이며 실패하면 대체 이미지를 사용합니다.

## 수동 확인과 배포

본인 학습용 데이터로 가입·로그인·복원·로그아웃, 글 CRUD, 댓글 작성·삭제, 좋아요·해제, 프로필·팔로우·개인 피드, 설정 저장을 확인합니다. 실패 경로는 잘못된 로그인, 공백 입력, 권한 없는 수정 URL, 없는 글, 네트워크 실패, 빠른 화면 이동, 로그아웃 후 뒤로가기를 확인합니다. 모바일 폭·키보드 이동도 별도로 점검합니다.

배포 시 `dist/`를 정적 호스팅하고, `/article/...` 같은 직접 접근도 `index.html`로 보내는 SPA fallback을 설정해야 합니다. 배포한 뒤에도 모의 API로 동작합니다.

## 공식 문서

- [React Hook Form](https://react-hook-form.com/get-started)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Router Declarative routing](https://reactrouter.com/start/declarative/routing)
- [RealWorld API 계약](https://github.com/realworld-apps/realworld/blob/main/specs/api/openapi.yml)
- [react-markdown](https://github.com/remarkjs/react-markdown)
