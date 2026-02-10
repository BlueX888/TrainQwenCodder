// 全局变量用于状态验证
let gameScore = 0;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    // 使用 originX: 1 让文本右对齐
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每3秒触发一次
    this.timerEvent = this.time.addEvent({
      delay: 3000,              // 3秒 = 3000毫秒
      callback: this.addScore,  // 回调函数
      callbackScope: this,      // 回调函数的作用域
      loop: true                // 循环执行
    });

    // 添加视觉提示 - 在屏幕中央显示说明
    this.add.text(400, 300, 'Auto Score System\n+3 every 3 seconds', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 添加一个进度条显示下次加分的倒计时
    this.progressBar = this.add.graphics();
    this.progressBarBg = this.add.graphics();
    
    // 绘制进度条背景
    this.progressBarBg.fillStyle(0x222222, 1);
    this.progressBarBg.fillRect(250, 350, 300, 20);
  }

  update(time, delta) {
    // 更新进度条显示倒计时
    if (this.timerEvent) {
      const progress = this.timerEvent.getProgress();
      
      // 清除并重绘进度条
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ff00, 1);
      this.progressBar.fillRect(250, 350, 300 * progress, 20);
    }
  }

  addScore() {
    // 增加分数
    this.score += 3;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 同步到全局变量以便验证
    gameScore = this.score;
    
    // 添加视觉反馈 - 分数闪烁效果
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });
    
    // 控制台输出用于调试
    console.log('Score increased to:', this.score);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露验证函数
window.getGameScore = function() {
  return gameScore;
};