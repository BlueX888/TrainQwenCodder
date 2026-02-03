// 完整的 Phaser3 自动加分系统
const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

let score = 0;
let scoreText;
let autoScoreTimer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本（字体大小16）
  // 使用 originX: 1 让文本右对齐，便于放置在右上角
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建自动加分定时器
  // 每1.5秒（1500毫秒）触发一次，loop: true 表示循环执行
  autoScoreTimer = this.time.addEvent({
    delay: 1500,              // 1.5秒
    callback: addScore,       // 回调函数
    callbackScope: this,      // 回调作用域
    loop: true                // 循环执行
  });
  
  // 输出初始状态用于验证
  console.log('Auto-score system initialized. Score:', score);
}

function addScore() {
  // 每次加3分
  score += 3;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 输出当前分数用于验证
  console.log('Score updated:', score);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
  // 分数更新由定时器自动处理
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露全局变量用于状态验证
if (typeof window !== 'undefined') {
  window.getGameScore = () => score;
  window.getScoreTimer = () => autoScoreTimer;
}