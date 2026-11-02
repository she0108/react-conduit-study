const STORAGE_KEY = "conduit-mock-db";

const TOPICS = [
  {
    title: "React 상태 끌어올리기",
    description: "형제 컴포넌트가 같은 값을 쓰려면 어디에 state를 둘까요?",
    tag: "react",
  },
  {
    title: "useEffect 정리 함수 이해하기",
    description: "오래된 응답이 새 화면을 덮지 않게 하는 방법을 살펴봅니다.",
    tag: "react",
  },
  {
    title: "JavaScript 비동기 첫걸음",
    description: "Promise와 async/await의 흐름을 한 번에 정리합니다.",
    tag: "javascript",
  },
  {
    title: "CSS Grid로 레이아웃 잡기",
    description: "float 없이 반응형 레이아웃을 만드는 기본 패턴입니다.",
    tag: "css",
  },
  {
    title: "처음 만드는 REST API 요청",
    description: "fetch로 요청을 보내고 오류를 구분하는 방법을 알아봅니다.",
    tag: "webdev",
  },
];

function createSeed() {
  const users = [
    {
      id: 1,
      email: "demo@conduit.test",
      username: "demo",
      password: "password123",
      bio: "Conduit을 둘러보는 데모 계정입니다.",
      image: null,
      following: [2],
    },
    {
      id: 2,
      email: "john@conduit.test",
      username: "johndoe",
      password: "password123",
      bio: "프론트엔드 개발을 공부하고 있습니다.",
      image: null,
      following: [],
    },
    {
      id: 3,
      email: "jane@conduit.test",
      username: "janedoe",
      password: "password123",
      bio: null,
      image: null,
      following: [],
    },
  ];

  const articles = Array.from({ length: 25 }, (_, index) => {
    const number = 25 - index;
    const topic = TOPICS[index % TOPICS.length];
    const createdAt = new Date(Date.UTC(2026, 0, 31 - index)).toISOString();

    return {
      id: number,
      slug: `article-${number}`,
      title: `${topic.title} ${number}`,
      description: topic.description,
      body: `## ${topic.title}\n\n${topic.description}\n\n\`\`\`js\nconsole.log("Conduit ${number}");\n\`\`\``,
      tagList: index % 2 ? [topic.tag] : [topic.tag, "beginners"],
      createdAt,
      updatedAt: createdAt,
      authorId: (index % 3) + 1,
      favoritedBy: index % 4 === 0 ? [2] : [],
    };
  });

  const comments = [
    {
      id: 1,
      articleId: 25,
      authorId: 2,
      body: "덕분에 흐름이 이해됐어요.",
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    },
    {
      id: 2,
      articleId: 25,
      authorId: 3,
      body: "예제 코드가 도움이 됐습니다.",
      createdAt: "2026-02-02T00:00:00.000Z",
      updatedAt: "2026-02-02T00:00:00.000Z",
    },
  ];

  return { users, articles, comments };
}

// 새로고침해도 가입한 계정과 작성한 글이 남도록 localStorage에 보관한다.
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? createSeed();
  } catch {
    return createSeed();
  }
}

export const db = load();

export function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function nextId(records) {
  return Math.max(0, ...records.map((record) => record.id)) + 1;
}
