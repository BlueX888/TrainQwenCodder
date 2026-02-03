// 完整的 Phaser3 自动加分系统
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右侧边距 20
      20, // 顶部边距 20
      'Score: 0',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    // 设置文本原点为右上角，便于对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器：每 3 秒增加 20 分
    this.scoreTimer = this.time.addEvent({
      delay: 3000, // 3 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景色以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setDepth(-1); // 设置为背景层

    // 添加提示信息
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score will increase by 20\nevery 3 seconds',
      {
        fontSize: '24px',
        color: '#00ff00',
        fontFamily: 'Arial',
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 增加分数
    this.score += 20;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加简单的视觉反馈：文本缩放动画
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });

    // 在控制台输出分数变化（便于验证）
    console.log('Score updated:', this.score);
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
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container' // 可选：指定父容器
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露 score 供外部验证（可选）
window.getGameScore = function() {
  const scene = game.scene.getScene('GameScene');
  return scene ? scene.score : 0;
};