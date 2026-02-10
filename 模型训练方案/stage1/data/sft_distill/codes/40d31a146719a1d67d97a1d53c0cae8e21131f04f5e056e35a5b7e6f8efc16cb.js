class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    // 使用 originX: 1 使文本右对齐
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每500ms触发一次
    this.timerEvent = this.time.addEvent({
      delay: 500,           // 延迟500毫秒
      callback: this.addScore, // 回调函数
      callbackScope: this,  // 回调函数的作用域
      loop: true            // 循环执行
    });

    // 添加视觉反馈：创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 添加提示文本
    this.add.text(400, 300, 'Auto Score System\n+12 every 0.5s', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加12分
    this.score += 12;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加视觉反馈：文本缩放动画
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
  }

  update(time, delta) {
    // 可选：在控制台输出当前分数用于验证
    // console.log('Current Score:', this.score);
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);