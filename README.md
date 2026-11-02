# Conduit: React로 직접 구현

props, state, effect를 배운 뒤 실제 기능에서 어떻게 연결되는지 찾아 읽는 예제입니다. 상태, 조회, 폼을 라이브러리 없이 구현했습니다. 같은 기능을 라이브러리로 만든 버전은 `react-with-libraries` 브랜치에 있습니다.

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

| 개념             | 코드                                      |
| ---------------- | ----------------------------------------- |
| props            | `ArticleCard.jsx`                         |
| state와 폼       | `LoginPage.jsx`, `EditorPage.jsx`         |
| effect와 cleanup | `useArticles.js`                          |
| 상태 끌어올리기  | `FavoriteButton.jsx`의 `onFavoriteChange` |
| Context          | `AuthProvider.jsx`, `useAuth.js`          |
| URL 상태         | `HomePage.jsx`, `Pagination.jsx`          |
| API 요청         | `src/apis/client.js`                      |
