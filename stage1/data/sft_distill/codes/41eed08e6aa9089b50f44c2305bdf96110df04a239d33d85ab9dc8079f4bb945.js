class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，放置在屏幕右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘20像素
      20, // 距离顶部20像素
      'Score: 0',
      {
        fontSize: '80px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本的原点为右上角，方便右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件，每1.5秒执行一次
    this.scoreTimer = this.time.addEvent({
      delay: 1500, // 1.5秒 = 1500毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景色以便观察（可选）
    this.cameras.main.setBackgroundColor('#2d2d2d');
  }

  addScore() {
    // 每次增加8分
    this.score += 8;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台以便验证
    console.log('Current Score:', this.score);
  }

  update(time, delta) {
    // 本例中不需要每帧更新逻辑
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);