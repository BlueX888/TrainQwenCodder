class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 在屏幕右上角创建分数文本
    // 使用 originX: 1 让文本右对齐，方便定位到右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘 20 像素
      20, // 距离顶部 20 像素
      `Score: ${this.score}`,
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器：每 0.5 秒（500ms）加 5 分
    this.scoreTimer = this.time.addEvent({
      delay: 500, // 延迟 500 毫秒
      callback: this.increaseScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加视觉反馈：绘制一个背景框
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRoundedRect(
      this.cameras.main.width - 160,
      10,
      150,
      40,
      10
    );

    // 将文本置于最上层
    this.scoreText.setDepth(1);

    // 添加调试信息（可选）
    console.log('Auto-scoring system initialized');
    console.log('Score increases by 5 every 0.5 seconds');
  }

  increaseScore() {
    // 每次调用增加 5 分
    this.score += 5;
    
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

    // 调试输出
    console.log(`Score updated: ${this.score}`);
  }

  update(time, delta) {
    // 可选：在这里添加其他更新逻辑
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
const game = new Phaser.Game(config);

// 暴露 score 用于验证（可选）
window.getScore = function() {
  const scene = game.scene.getScene('GameScene');
  return scene ? scene.score : 0;
};