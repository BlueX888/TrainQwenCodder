class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rectangleCount = 0;
    this.maxRectangles = 12;
    this.timerEvent = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 生成紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('purpleRect', 40, 40);
    graphics.destroy();

    // 创建定时器事件，每1秒执行一次
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.spawnRectangle,
      callbackScope: this,
      loop: true
    });

    // 显示提示文本
    this.add.text(10, 10, 'Spawning purple rectangles...', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示计数器文本
    this.counterText = this.add.text(10, 30, `Count: 0 / ${this.maxRectangles}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  spawnRectangle() {
    // 检查是否已达到最大数量
    if (this.rectangleCount >= this.maxRectangles) {
      // 移除定时器
      if (this.timerEvent) {
        this.timerEvent.remove();
        this.timerEvent = null;
      }
      
      // 显示完成提示
      this.add.text(10, 50, 'All rectangles spawned!', {
        fontSize: '16px',
        color: '#00ff00'
      });
      return;
    }

    // 生成随机位置（确保矩形完全在画布内）
    const x = Phaser.Math.Between(20, 780);
    const y = Phaser.Math.Between(70, 580);

    // 创建紫色矩形
    const rect = this.add.image(x, y, 'purpleRect');
    
    // 添加简单的缩放动画效果
    this.tweens.add({
      targets: rect,
      scale: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });

    // 增加计数器
    this.rectangleCount++;
    
    // 更新计数器文本
    this.counterText.setText(`Count: ${this.rectangleCount} / ${this.maxRectangles}`);
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
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);