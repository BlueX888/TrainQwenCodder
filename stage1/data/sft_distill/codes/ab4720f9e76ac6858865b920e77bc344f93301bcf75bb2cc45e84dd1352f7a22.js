// 完整的 Phaser3 自动加分系统
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

// 全局变量用于验证状态
let score = 0;
let scoreText = null;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在右上角
  // 使用 originX: 1 使文本右对齐
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件：每 2 秒执行一次
  timerEvent = this.time.addEvent({
    delay: 2000,                // 2000 毫秒 = 2 秒
    callback: addScore,         // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true                  // 循环执行
  });
  
  // 添加视觉提示：显示计时器进度条
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 0.3);
  graphics.fillRect(10, 10, 200, 20);
  
  const progressText = this.add.text(10, 40, 'Next +20 in: 2.0s', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
  
  // 存储引用用于 update
  this.progressText = progressText;
  this.progressBar = this.add.graphics();
}

function addScore() {
  // 增加分数
  score += 20;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加闪烁效果提示加分
  scoreText.setTint(0xffff00); // 黄色高亮
  
  // 0.2 秒后恢复原色
  setTimeout(() => {
    if (scoreText) {
      scoreText.clearTint();
    }
  }, 200);
  
  console.log('Score updated:', score);
}

function update(time, delta) {
  // 更新计时器进度显示
  if (timerEvent && this.progressText && this.progressBar) {
    const progress = timerEvent.getProgress();
    const remaining = timerEvent.getRemaining() / 1000;
    
    // 更新进度条
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 0.6);
    this.progressBar.fillRect(10, 10, 200 * (1 - progress), 20);
    
    // 更新倒计时文本
    this.progressText.setText('Next +20 in: ' + remaining.toFixed(1) + 's');
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { score, scoreText, timerEvent };
}