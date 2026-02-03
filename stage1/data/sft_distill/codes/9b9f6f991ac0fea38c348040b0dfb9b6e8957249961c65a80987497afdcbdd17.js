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
    // 初始化分数
    this.score = 0;
    gameScore = 0;

    // 在右上角创建分数文本
    // 使用 originX: 1 让文本右对齐，便于定位在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘20像素
      20, // 距离顶部20像素
      'Score: 0',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件：每500毫秒（0.5秒）加5分
    this.scoreTimer = this.time.addEvent({
      delay: 500, // 500毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setDepth(-1); // 置于底层
  }

  addScore() {
    // 每次调用增加5分
    this.score += 5;
    gameScore = this.score;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 可选：添加简单的动画效果
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);