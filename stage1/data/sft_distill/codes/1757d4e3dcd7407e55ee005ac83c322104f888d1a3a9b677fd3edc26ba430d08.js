class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态变量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    // 使用 originX: 1 让文本右对齐，便于固定在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘 20 像素
      20, // 距离顶部 20 像素
      `Score: ${this.score}`,
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每 2.5 秒（2500ms）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加视觉反馈：背景颜色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 添加提示文本
    const hintText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score increases by 5 every 2.5 seconds',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#cccccc'
      }
    );
    hintText.setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加 5 分
    this.score += 5;
    
    // 更新分数文本显示
    this.scoreText.setText(`Score: ${this.score}`);
    
    // 添加视觉反馈：文本缩放动画
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
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  // 如果需要在 Node.js 环境运行测试，可以使用 Phaser.HEADLESS
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出 scene 实例以便测试验证状态
// 可以通过 game.scene.getScene('GameScene').score 访问分数