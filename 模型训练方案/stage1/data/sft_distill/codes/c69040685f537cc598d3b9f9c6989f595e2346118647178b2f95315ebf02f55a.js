class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hexagon = null;
    this.moveSpeed = 100; // 每秒移动像素数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 绘制六边形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.lineStyle(3, 0xffffff, 1);
    
    // 绘制六边形（中心点在 0,0）
    const size = 30;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      points.push(new Phaser.Math.Vector2(x, y));
    }
    
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // 将 Graphics 生成为纹理
    graphics.generateTexture('hexagonTex', size * 2, size * 2);
    graphics.destroy();
    
    // 创建六边形精灵，初始位置在场景中心偏下
    this.hexagon = this.add.sprite(400, 500, 'hexagonTex');
    
    // 设置相机跟随六边形
    // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
    // roundPixels: 是否将相机位置四舍五入到整数像素
    // lerpX, lerpY: 平滑跟随的插值系数 (0-1)，1 表示立即跟随
    this.cameras.main.startFollow(this.hexagon, true, 0.1, 0.1);
    
    // 添加一些参考背景网格，方便观察移动效果
    this.createBackgroundGrid();
    
    // 添加提示文本（固定在相机上）
    const text = this.add.text(10, 10, '六边形自动向上移动\n相机跟随并保持居中', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机上，不随场景滚动
  }

  update(time, delta) {
    // 让六边形持续向上移动
    // delta 是毫秒数，需要转换为秒
    if (this.hexagon) {
      this.hexagon.y -= this.moveSpeed * (delta / 1000);
      
      // 可选：当六边形移动到很远时重置位置（演示循环效果）
      if (this.hexagon.y < -1000) {
        this.hexagon.y = 500;
      }
    }
  }

  createBackgroundGrid() {
    // 创建网格背景，方便观察相机移动
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5);
    
    const gridSize = 100;
    const worldWidth = 800;
    const worldHeight = 2000;
    
    // 绘制垂直线
    for (let x = 0; x <= worldWidth; x += gridSize) {
      gridGraphics.lineBetween(x, -worldHeight, x, worldHeight);
    }
    
    // 绘制水平线
    for (let y = -worldHeight; y <= worldHeight; y += gridSize) {
      gridGraphics.lineBetween(0, y, worldWidth, y);
    }
    
    // 添加坐标标记
    const style = { fontSize: '12px', color: '#666666' };
    for (let y = 0; y >= -worldHeight; y -= 200) {
      this.add.text(10, y, `Y: ${y}`, style);
    }
    for (let y = 200; y <= worldHeight; y += 200) {
      this.add.text(10, y, `Y: ${y}`, style);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  // 扩展世界边界以允许相机跟随对象移动
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

// 创建游戏实例
new Phaser.Game(config);