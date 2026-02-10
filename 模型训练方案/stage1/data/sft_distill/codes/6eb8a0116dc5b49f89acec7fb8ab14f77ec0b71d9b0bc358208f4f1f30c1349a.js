class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，显示在屏幕右上角
    // 使用 setOrigin(1, 0) 使文本右对齐
    this.scoreText = this.add.text(
      this.cameras.main.width - 20,  // 距离右边缘20像素
      20,                             // 距离顶部20像素
      `Score: ${this.score}`,
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    this.scoreText.setOrigin(1, 0);  // 右上角对齐

    // 创建定时器事件，每4秒触发一次
    this.timerEvent = this.time.addEvent({
      delay: 4000,                    // 4秒 = 4000毫秒
      callback: this.addScore,        // 回调函数
      callbackScope: this,            // 回调函数的作用域
      loop: true                      // 循环执行
    });

    // 添加一些视觉反馈（可选）
    // 绘制一个背景矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 0.8);
    graphics.fillRect(
      this.cameras.main.width - 180,
      10,
      170,
      40
    );

    // 将文本置于最上层
    this.scoreText.setDepth(1);

    // 添加提示文本
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score auto-increments every 4 seconds\n+5 points per cycle',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#00ff00',
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加5分
    this.score += 5;
    
    // 更新文本显示
    this.scoreText.setText(`Score: ${this.score}`);
    
    // 添加视觉反馈：文本闪烁效果
    this.scoreText.setScale(1.2);
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    // 控制台输出用于验证
    console.log(`Score updated: ${this.score}`);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
    // 本例中主要逻辑由定时器驱动，不需要在 update 中处理
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

// 导出 score 用于外部验证（可选）
if (typeof window !== 'undefined') {
  window.getScore = () => {
    const scene = game.scene.getScene('GameScene');
    return scene ? scene.score : 0;
  };
}