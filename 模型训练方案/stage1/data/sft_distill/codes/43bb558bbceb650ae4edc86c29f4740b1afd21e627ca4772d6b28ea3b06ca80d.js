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
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右侧，留20像素边距
      20, // 顶部，留20像素边距
      `Score: ${this.score}`,
      {
        fontSize: '80px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本右对齐（从右上角开始）
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件：每2秒加20分
    this.scoreTimer = this.time.addEvent({
      delay: 2000,           // 2秒 = 2000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加提示文本
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score increases by 20 every 2 seconds',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffff00'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 增加分数
    this.score += 20;
    
    // 更新文本显示
    this.scoreText.setText(`Score: ${this.score}`);
    
    // 添加缩放动画效果（可选，增强视觉反馈）
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

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

const game = new Phaser.Game(config);

// 暴露场景实例以便验证 score 值
window.getGameScore = () => {
  const scene = game.scene.getScene('GameScene');
  return scene ? scene.score : 0;
};