const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const fileType = require("file-type"); //file type을 검사하기 위해 필요한 모듈

const nouns = [
  "재료역학",
  "경영학개론",
  "유체역학",
  "양자역학",
  "분자세포생물학",
  "제조 프로세스 혁신",
  "기초 디자인",
  "분자생물학",
  "열과 분자의 이동",
  "현대대수학",
  "소재역학",
  "원자로 이론",
  "지성과 문명 강독",
  "운영체제 및 실험",
  "전자설계 및 실험",
  "기초항공프로젝트",
  "화학전공실험",
];

const adjectives = [
  "정직한",
  "재미있는",
  "재미없는",
  "자신감 있는",
  "여유로운",
  "애정깊은",
  "귀여운",
  "사랑스러운",
  "사려깊은",
  "침착한",
  "끈질긴",
  "친절한",
  "다급한",
  "징징대는",
  "밉상인",
  "엄격한",
  "공격적인",
  "발끈하는",
  "까다로운",
  "고삐풀린 망아지 같은",
];

// 닉네임 규칙에 따라 새 유저의 닉네임을 생성해 반환합니다.
// Ara의 닉네임 생성 규칙을 참고하였습니다.
const generateNickname = (id) => {
  const nounIdx = crypto.randomInt(nouns.length);
  const adjectiveIdx = crypto.randomInt(adjectives.length);
  const noun = nouns[nounIdx];
  const adjective = adjectives[adjectiveIdx];

  // 닉네임 중복을 방지하기 위해 해시값 일부를 붙입니다.
  const hash = crypto.createHash("sha256");
  hash.update(noun + adjective + id);
  const postfix = hash.digest("hex").substring(0, 5);

  const nickname = `${adjective} ${noun}_${postfix}`;
  return nickname;
};

// 기존 프로필 사진의 URI 중 하나를 무작위로 선택해 반환합니다.
const generateProfileImageUrl = (id) => {
  const fileNames = fs.readdirSync(
    path.resolve("public/profile-images/default/")
  );
  const fileIdx = crypto.randomInt(fileNames.length);
  const fileName = fileNames[fileIdx];

  const imgUrl = `public/profile-images/default/${fileName}`;
  return imgUrl;
};

// 업로드된 파일의 경로가 주어졌을 때, 해당 파일(buffer)의 magic number를 계산해 해당 파일이 이미지인지 판별합니다.
const checkProfileImage = async (filePath) => {
  const imageFileType = await fileType.fromFile(filePath);
  if (!imageFileType || imageFileType.mime.split("/")[0] != "image")
    return false;
  else return true;
};

module.exports = {
  generateNickname,
  generateProfileImageUrl,
  checkProfileImage,
};
