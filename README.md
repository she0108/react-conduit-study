# Conduit React 참고 예제

props·state·effect를 배운 뒤 실제 기능의 연결을 찾아 읽는 JavaScript·JSX 예제입니다. React state·Context, fetch, 제어 폼을 사용합니다. 이 구조가 유일한 정답은 아닙니다.

## 실행

```sh
npm install
cp .env.example .env.local
npm run dev
```

Node.js 22.12 이상 또는 20.x의 20.19 이상이 필요합니다. Vite가 표시한 주소로 접속합니다. 기본 API는 `https://api.realworld.show/api`이며, 다른 RealWorld 호환 서버를 사용하려면 `.env.local`의 `VITE_API_BASE_URL`을 바꾼 뒤 개발 서버를 재시작합니다. 비밀키를 `VITE_` 환경변수에 넣지 않습니다.

```sh
npm run lint
npm run format:check
npm run build
npm run preview
```

`npm run format`은 코드 포맷을 정리합니다. 자동 테스트 파일·라이브러리·스크립트는 두지 않습니다.

## 화면과 진입 파일

| URL                            | 파일                                | 주요 기능                                    |
| ------------------------------ | ----------------------------------- | -------------------------------------------- |
| `/`                            | `src/pages/HomePage.jsx`            | 전체·개인 피드, 태그, 페이지네이션           |
| `/login`, `/register`          | `LoginPage.jsx`, `RegisterPage.jsx` | 로그인·가입, 원래 내부 경로 복귀             |
| `/article/:slug`               | `ArticlePage.jsx`                   | Markdown, 좋아요, 팔로우, 댓글, 본인 글 삭제 |
| `/editor`, `/editor/:slug`     | `EditorPage.jsx`                    | 제어 폼, 태그, 작성·수정, 작성자 확인        |
| `/profile/:username`           | `ProfilePage.jsx`                   | 프로필·작성한 글                             |
| `/profile/:username/favorites` | `ProfilePage.jsx`                   | 좋아요한 글·해제 후 목록 갱신                |
| `/settings`                    | `SettingsPage.jsx`                  | 프로필·이메일·비밀번호 설정, 로그아웃        |

에디터와 설정은 로그인 후 접근합니다. 글 수정은 작성자를 추가로 확인합니다. 실제 변경 권한은 서버에서도 검사합니다.

## 코드를 읽는 순서

- `src/apis/`: 공통 HTTP 처리와 각 엔드포인트. `client.js`는 응답·서버 오류·취소를 처리하며 React를 import하지 않습니다.
- `src/contexts/`, `src/hooks/useAuth.js`: 현재 사용자, 토큰 복원, 로그인·로그아웃, 인증 실패 처리.
- `src/hooks/useArticles.js`: URL 조건과 인증 변화에 따른 목록 조회, effect cleanup과 오래된 응답 무시.
- `src/pages/`: URL 해석, 페이지 데이터와 폼 상태.
- `src/components/`: Layout, 반복 UI, 댓글, 명시적인 props와 callback.
- `src/utils/`: 토큰 저장, 날짜 표시, 페이지·복귀 경로 검증.
- `src/styles/global.css`: 공통 기본 요소·변수. 각 화면·컴포넌트 스타일은 인접한 CSS Modules에 둡니다.

읽기 흐름은 `URL → page/useArticles → API → fetch → state → props → UI`입니다. 쓰기는 이벤트 핸들러에서 요청하고 성공 응답을 상태에 반영합니다.

| 학습 개념       | 찾아볼 코드                                           |
| --------------- | ----------------------------------------------------- |
| props           | `ArticleCard.jsx`의 article                           |
| state·제어 폼   | `EditorPage.jsx`의 입력과 검증                        |
| effect·취소     | `useArticles.js`의 AbortController와 cleanup          |
| 상태 끌어올리기 | `FavoriteButton.jsx` → onChange → 목록·상세 소유 상태 |
| Context         | `AuthProvider.jsx` → useAuth → Header·ProtectedRoute  |
| URL 상태        | HomePage·ProfilePage의 search params와 페이지 링크    |

## API와 인증

[공식 RealWorld API](https://docs.realworld.show/specifications/frontend/api/)를 사용합니다. 공개 데모에서는 비로그인 사용자는 데모 글만, 로그인 사용자는 본인과 데모 계정의 글만 볼 수 있습니다. 팔로우·개인 피드는 데모 작성자로 확인하세요. 서로 다른 일반 계정 사이의 글 공유는 제한됩니다.

토큰만 localStorage에 저장하고, 시작할 때 `/user`로 사용자를 복원합니다. 401이면 토큰을 지우고, 일시적인 연결·서버 오류면 토큰을 유지한 채 재시도 화면을 보여 줍니다. 비밀번호·사용자 객체 전체는 저장하지 않습니다. 이 토큰 저장 방식은 학습용 API 계약에 따른 선택입니다.

입력 오류는 서버의 필드별 오류와 함께 표시합니다. Markdown은 raw HTML 플러그인 없이 렌더링합니다. 프로필 이미지는 URL 입력 방식이며 실패하면 대체 이미지를 사용합니다.

## 수동 확인과 배포

본인 학습용 데이터로 가입·로그인·복원·로그아웃, 글 CRUD, 댓글 작성·삭제, 좋아요·해제, 프로필·팔로우·개인 피드, 설정 저장을 확인합니다. 실패 경로는 잘못된 로그인, 공백 입력, 권한 없는 수정 URL, 없는 글, 네트워크 실패·재시도, 빠른 화면 이동, 로그아웃 후 뒤로가기를 확인합니다. 모바일 폭·키보드 이동도 별도로 점검합니다.

2026-11-02 브라우저 사전 확인에서 공개 조회, JSON·인증 CORS, 가입·로그인·현재 사용자 조회, 본인 글 CRUD가 성공했습니다. 공개 API의 가용성과 데이터는 서버 상태에 따라 달라집니다.

배포 시 `dist/`를 정적 호스팅하고, `/article/...` 같은 직접 접근도 `index.html`로 보내는 SPA fallback을 설정해야 합니다. API 서버는 배포 Origin의 CORS도 허용해야 합니다.

## 공식 문서

- [React effect와 cleanup](https://react.dev/learn/synchronizing-with-effects)
- [React Router Declarative routing](https://reactrouter.com/start/declarative/routing)
- [RealWorld API 계약](https://github.com/realworld-apps/realworld/blob/main/specs/api/openapi.yml)
- [react-markdown](https://github.com/remarkjs/react-markdown)
