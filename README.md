# AuditMate

**AuditMate**는 회계 업무 중 반복적이고 규칙 기반(rule-based) 작업을 자동화하기 위한 도구입니다.
회계사 선배님의 실무 경험에서 비롯된 실제 니즈를 바탕으로 설계되었으며,
기업의 회계 서류를 분석하고, 미흡 내역을 정리해 전달하는 업무 프로세스를 지원합니다.

## 🧾 프로젝트 개요

회계사의 실제 업무 흐름 중 반복적이고 수작업으로 진행되던 작업을 자동화하여 업무 효율성을 높이고자 시작된 프로젝트입니다.
AuditMate는 다음과 같은 프로세스를 중심으로 설계되었습니다:

1. **외부 회계 지침서 파악**
2. **의뢰 기업의 내역 확인**
3. **의뢰 기업의 관련 서류 확인**
4. **서류 내 미흡 내역 정리**
5. **미흡 내역 의뢰 기업에 전달**

이 중 **2\~4단계**는 규칙 기반으로 자동화 가능한 반복 작업으로 분석되었고, 이를 중심으로 기능을 개발하고 있습니다.

## 🎯 주요 기능

* 회계 관련 서류 업로드 및 파싱
* 규칙 기반(rule-based) 내역 검토 자동화
* 미흡 사항 자동 분류 및 요약
* 미흡 내역 리포트 생성 및 내보내기 
* 사용자 정의 규칙(rule) 추가/수정 기능 

## 💡 프로젝트 배경

정보처리기사 자격증을 준비하며 배운 **요구사항 분석 기법**을 실제 프로젝트에 적용해본 첫 경험입니다.
의뢰인의 아이디어를 구체화하며, 실제 사용자와의 커뮤니케이션을 통해 프로그램 설계를 진행했습니다.

## 🛠️ 기술 스택

* Backend: Python, Django 
* Frontend: React 

## 📁 프로젝트 구조 (예시)

```
auditmate/
├── backend/
│   ├── api/
│   └── rules/
├── app/
│   └── components/
└── README.md
```

## 📌 향후 계획

* 사용자 맞춤 규칙 기반 검토 기능 강화
* Web UI 개선 및 배포
* 다양한 회계 서류 포맷 지원 확대


## 🤝 기여자

* [Jun Pyo Yang](https://www.linkedin.com/in/dardnatsyang/) - 기획
* **\[@go0leum]** - 요구사항 분석, 개발

## ⌨️ 단축키 안내

AuditMate의 ReviewTable 화면에서는 아래와 같은 키보드 단축키를 지원합니다.
메모 및 보완사항을 입력할때를 제와하고 최대한 키패드만으로 작업할 수 있도록 구성되었습니다.

| 단축키            | 동작 설명                                      |
|-------------------|-----------------------------------------------|
| 1~9, 0            | 검토 문서 1~10번 선택 (0은 10번)               |
| +1 ~ +9, +0       | 검토 문서 11~20번 선택 (예: +8은 18번, +0은 20번) |
| m 또는 /          | 메모 입력란(메모 input)으로 포커스 이동         |
| c 또는 *          | 보완사항 입력란(보완사항 input)으로 포커스 이동  |
| 영문/한글 문자    | 입력 시 자동으로 메모 입력란에 포커스           |
| Enter             | (메모/보완사항 입력 중) 입력란 비활성화(blur)   |
| ArrowLeft 또는 .  | 이전 행(Prev)으로 이동                         |
| ArrowRight 또는 Enter | 다음 행(Next)으로 이동                     |
| e 또는 E          | TableDrawer(오른쪽 패널) 닫기                  |

> **참고:**  
> - 입력란에 포커스가 있을 때는 단축키가 동작하지 않습니다(Enter 제외).
> - 검토 문서가 10개를 넘는 경우, +와 숫자 조합으로 20번까지 선택할 수 있습니다.

---

## ⚡ 설치 및 실행 가이드

### 1. 백엔드 (Django) - Python 사용

#### Python 및 pip 설치
- [Python 공식 홈페이지](https://www.python.org/downloads/)에서 설치
- 설치 후, 아래 명령어로 버전 확인:
  ```
  python --version
  pip --version
  ```

#### 가상환경 생성 (권장)
- Windows:
  ```
  python -m venv venv
  venv\Scripts\activate
  ```
- macOS/Linux:
  ```
  python3 -m venv venv
  source venv/bin/activate
  ```

#### Django 및 의존성 설치
  ```
  cd auditmate/backend
  pip install -r requirements.txt
  ```


### 2. 프론트엔드 (React) - Yarn 사용

#### Yarn 설치
- [Yarn 공식 홈페이지](https://classic.yarnpkg.com/lang/en/docs/install/) 참고
- Windows에서 PowerShell 또는 명령 프롬프트에 아래 명령어 입력:
  ```
  npm install -g yarn
  ```

#### 프론트엔드 의존성 설치
  ```
  cd auditmate/app
  yarn install
  ```

#### 개발 서버 실행
  ```
  yarn start
  ```

---
---

필요시 다음 내용을 추가할 수 있습니다:

* API 명세 링크
* 회계 규정 문서 레퍼런스
* 예시 보고서 스크린샷

---