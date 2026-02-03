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
let scoreText;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本对象
  // 位置：右上角，向左偏移 20 像素，向下偏移 20 像素
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本原点为右上角，使其右对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件：每 1000ms（1秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 延迟时间（毫秒）
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加说明文字
  this.add.text(400, 300, 'Auto Score System\n+20 every second', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 添加装饰性背景框
  const graphics = this.add.graphics();
  graphics.fillStyle(0x000000, 0.5);
  graphics.fillRoundedRect(680, 10, 110, 70, 10);
}

function addScore() {
  // 每次调用增加 20 分
  score += 20;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加视觉反馈：短暂放大效果
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power1'
  });
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
  // 分数更新由定时器事件驱动
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态供验证（可选）
window.getGameState = function() {
  return {
    score: score,
    timerRunning: timerEvent && !timerEvent.paused,
    timerDelay: timerEvent ? timerEvent.delay : 0
  };
};