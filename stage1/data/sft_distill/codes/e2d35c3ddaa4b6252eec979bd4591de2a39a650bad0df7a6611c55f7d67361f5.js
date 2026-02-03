const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

let score = 0;
let scoreText;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在右上角
  scoreText = this.add.text(800, 20, 'Score: 0', {
    fontSize: '80px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本的原点为右上角，方便对齐
  scoreText.setOrigin(1, 0);
  
  // 添加定时器事件：每 2.5 秒（2500 毫秒）执行一次
  this.time.addEvent({
    delay: 2500,                // 延迟时间（毫秒）
    callback: addScore,         // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true                  // 循环执行
  });
  
  // 添加视觉提示：显示定时器工作状态
  const infoText = this.add.text(400, 300, 'Auto-scoring active!\n+15 every 2.5 seconds', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  });
  infoText.setOrigin(0.5);
  
  // 添加装饰性背景条
  const graphics = this.add.graphics();
  graphics.fillStyle(0x000000, 0.5);
  graphics.fillRect(650, 10, 140, 100);
}

function addScore() {
  // 增加分数
  score += 15;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加简单的动画效果：文本缩放
  scoreText.setScale(1.2);
  
  // 使用 tween 恢复原始大小
  this.tweens.add({
    targets: scoreText,
    scale: 1,
    duration: 200,
    ease: 'Power2'
  });
  
  // 在控制台输出，方便验证
  console.log('Score updated:', score);
}

// 创建游戏实例
new Phaser.Game(config);