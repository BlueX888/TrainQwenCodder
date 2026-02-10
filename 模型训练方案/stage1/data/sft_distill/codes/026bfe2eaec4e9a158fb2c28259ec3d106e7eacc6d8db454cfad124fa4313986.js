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
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // x 坐标：屏幕右侧减去边距
      20,                            // y 坐标：顶部边距
      `Score: ${this.score}`,
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本原点为右上角，方便对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器：每 3 秒执行一次
    this.scoreTimer = this.time.addEvent({
      delay: 3000,              // 3000 毫秒 = 3 秒
      callback: this.addScore,  // 回调函数
      callbackScope: this,      // 回调函数的作用域
      loop: true                // 循环执行
    });

    // 添加背景色以便观察
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 添加提示文本
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score increases by 20\nevery 3 seconds',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#cccccc',
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 增加分数
    this.score += 20;
    
    // 更新文本显示
    this.scoreText.setText(`Score: ${this.score}`);
    
    // 添加简单的缩放动画效果
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });

    // 输出日志便于验证
    console.log(`Score updated: ${this.score}`);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container' // 可选：指定父容器
};

// 创建游戏实例
new Phaser.Game(config);