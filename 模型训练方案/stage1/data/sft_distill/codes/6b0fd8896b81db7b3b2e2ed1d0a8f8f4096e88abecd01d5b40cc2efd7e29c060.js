class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, 
      20, 
      'Score: 0', 
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    // 设置文本锚点为右上角
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件：每2.5秒（2500毫秒）触发一次
    this.timerEvent = this.time.addEvent({
      delay: 2500,                // 延迟2.5秒
      callback: this.addScore,    // 回调函数
      callbackScope: this,        // 回调作用域
      loop: true                  // 循环执行
    });

    // 添加背景以便更好地看到分数文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setDepth(-1);

    // 添加提示信息
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score increases by 8\nevery 2.5 seconds',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#00ff00',
        align: 'center'
      }
    ).setOrigin(0.5);

    console.log('Game started. Score will increase every 2.5 seconds.');
  }

  addScore() {
    // 增加分数
    this.score += 8;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出验证信号
    console.log(`Score updated: ${this.score} (Timer elapsed: ${this.timerEvent.elapsed}ms)`);
    
    // 添加视觉反馈：分数增加时文本短暂放大
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 可选：在这里添加其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);