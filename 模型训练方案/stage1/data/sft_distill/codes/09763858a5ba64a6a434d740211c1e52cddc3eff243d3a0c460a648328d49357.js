class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hexagonCount = 0;
    this.maxHexagons = 15;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 绘制青色六边形纹理
    this.createHexagonTexture();

    // 创建定时器事件，每 0.5 秒生成一个六边形
    this.timerEvent = this.time.addEvent({
      delay: 500, // 0.5 秒 = 500 毫秒
      callback: this.spawnHexagon,
      callbackScope: this,
      loop: true
    });
  }

  createHexagonTexture() {
    const graphics = this.add.graphics();
    
    // 设置青色填充
    graphics.fillStyle(0x00ffff, 1);
    
    // 计算六边形的六个顶点（半径为 30）
    const radius = 30;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i; // 60度间隔
      const x = radius + radius * Math.cos(angle);
      const y = radius + radius * Math.sin(angle);
      points.push(new Phaser.Geom.Point(x, y));
    }
    
    // 绘制六边形
    graphics.fillPoints(points, true);
    
    // 生成纹理
    graphics.generateTexture('hexagon', radius * 2, radius * 2);
    
    // 销毁 graphics 对象（纹理已生成）
    graphics.destroy();
  }

  spawnHexagon() {
    // 检查是否已达到最大数量
    if (this.hexagonCount >= this.maxHexagons) {
      this.timerEvent.remove(); // 停止定时器
      return;
    }

    // 在随机位置生成六边形
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const hexagon = this.add.image(x, y, 'hexagon');
    
    // 增加计数器
    this.hexagonCount++;
    
    // 可选：添加一些视觉效果
    hexagon.setAlpha(0);
    this.tweens.add({
      targets: hexagon,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);