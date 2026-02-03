class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.circleCount = 0;
    this.maxCircles = 10;
    this.timerEvent = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('greenCircle', 40, 40);
    graphics.destroy();

    // 创建定时器事件，每2.5秒触发一次
    this.timerEvent = this.time.addEvent({
      delay: 2500, // 2.5秒 = 2500毫秒
      callback: this.spawnCircle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个圆形
    this.spawnCircle();
  }

  spawnCircle() {
    // 检查是否已达到最大数量
    if (this.circleCount >= this.maxCircles) {
      // 停止定时器
      if (this.timerEvent) {
        this.timerEvent.remove();
        this.timerEvent = null;
      }
      console.log('已生成10个圆形，停止生成');
      return;
    }

    // 生成随机位置（留出边距避免圆形被裁剪）
    const margin = 40; // 圆形直径
    const x = Phaser.Math.Between(margin, this.scale.width - margin);
    const y = Phaser.Math.Between(margin, this.scale.height - margin);

    // 创建圆形精灵
    const circle = this.add.image(x, y, 'greenCircle');
    
    // 计数器增加
    this.circleCount++;
    
    console.log(`生成第 ${this.circleCount} 个圆形，位置: (${x}, ${y})`);
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
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);