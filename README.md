# Conduit: 라이브러리로 구현

`react-only` 브랜치와 같은 앱을 라이브러리로 옮긴 버전입니다. `git diff react-only react-with-libraries`로 차이를, 커밋 이력으로 라이브러리별 변경을 볼 수 있습니다.

UI는 [RealWorld](https://github.com/realworld-apps/realworld) 프로젝트의 [Conduit 데모](https://demo.realworld.show/)를 참고했습니다.

| 영역        | `react-only`                      | 이 브랜치           |
| ----------- | --------------------------------- | ------------------- |
| 폼          | `useState`, 직접 검증             | React Hook Form     |
| 인증        | Context, localStorage 직접 접근   | Zustand + `persist` |
| 서버 데이터 | `useEffect`, `useState`, `ignore` | TanStack Query      |

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

## 코드 찾아보기

| 개념      | 코드                                |
| --------- | ----------------------------------- |
| 폼        | `LoginPage.jsx`, `EditorPage.jsx`   |
| 전역 상태 | `authStore.js`, `useCurrentUser.js` |
| 서버 조회 | `useArticles.js`                    |
| 서버 변경 | `FavoriteButton.jsx`                |
| 공통 설정 | `queryClient.js`                    |
