class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hexagonCount = 0;
    this.maxHexagons = 10;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 绘制青色六边形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    
    // 计算六边形的顶点（半径为30）
    const radius = 30;
    const hexagonPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
      const x = radius + radius * Math.cos(angle);
      const y = radius + radius * Math.sin(angle);
      hexagonPoints.push(x, y);
    }
    
    // 绘制六边形
    graphics.fillPoints(hexagonPoints, true);
    
    // 生成纹理
    graphics.generateTexture('hexagon', radius * 2, radius * 2);
    graphics.destroy();

    // 创建定时器，每0.5秒生成一个六边形
    this.timerEvent = this.time.addEvent({
      delay: 500, // 0.5秒 = 500毫秒
      callback: this.spawnHexagon,
      callbackScope: this,
      loop: true
    });
  }

  spawnHexagon() {
    // 检查是否已达到最大数量
    if (this.hexagonCount >= this.maxHexagons) {
      this.timerEvent.remove(); // 停止定时器
      console.log('已生成10个六边形，停止生成');
      return;
    }

    // 生成随机位置（确保六边形完全在画布内）
    const padding = 40; // 边距，避免六边形超出边界
    const randomX = Phaser.Math.Between(padding, this.scale.width - padding);
    const randomY = Phaser.Math.Between(padding, this.scale.height - padding);

    // 创建六边形精灵
    const hexagon = this.add.image(randomX, randomY, 'hexagon');
    
    // 增加计数
    this.hexagonCount++;
    
    console.log(`生成第 ${this.hexagonCount} 个六边形，位置: (${randomX}, ${randomY})`);
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

// 创建游戏实例
new Phaser.Game(config);