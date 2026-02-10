const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局分数变量，便于验证
let score = 0;
let scoreText = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在右上角
  // 使用 originX: 1 使文本右对齐
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '80px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本原点为右上角，方便右对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件，每2.5秒触发一次
  this.time.addEvent({
    delay: 2500,           // 2.5秒 = 2500毫秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加提示信息
  const infoText = this.add.text(400, 300, 'Score increases by 15 every 2.5 seconds', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  infoText.setOrigin(0.5);
  
  // 添加视觉反馈 - 背景装饰
  const graphics = this.add.graphics();
  graphics.fillStyle(0x444444, 0.3);
  graphics.fillRoundedRect(600, 10, 190, 100, 10);
}

function addScore() {
  // 增加分数
  score += 15;
  
  // 更新分数显示
  scoreText.setText('Score: ' + score);
  
  // 添加视觉反馈 - 缩放动画
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
  
  // 控制台输出，便于验证
  console.log('Score updated:', score);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出 score 变量供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { score, game };
}