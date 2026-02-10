class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.diamond = null;
    this.speed = 100; // 移动速度（像素/秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建菱形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff6b6b, 1);
    
    // 绘制菱形（使用四个点）
    const size = 30;
    const points = [
      { x: size, y: 0 },      // 上
      { x: size * 2, y: size }, // 右
      { x: size, y: size * 2 }, // 下
      { x: 0, y: size }        // 左
    ];
    
    graphics.fillPoints(points, true);
    
    // 生成纹理
    graphics.generateTexture('diamond', size * 2, size * 2);
    graphics.destroy();
    
    // 创建菱形精灵，初始位置在场景中心
    this.diamond = this.add.sprite(400, 300, 'diamond');
    
    // 设置相机跟随菱形
    this.cameras.main.startFollow(this.diamond, true, 0.1, 0.1);
    
    // 设置世界边界（让菱形可以移动到更大的区域）
    this.cameras.main.setBounds(0, 0, 2000, 2000);
    
    // 添加背景网格以便观察移动
    this.createGrid();
    
    // 添加提示文本（固定在相机上）
    const text = this.add.text(10, 10, '菱形自动向右上移动\n相机跟随中...', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机上
  }

  update(time, delta) {
    // 让菱形向右上方移动
    // 计算每帧移动距离（delta 是毫秒）
    const moveDistance = (this.speed * delta) / 1000;
    
    // 45度角移动（右上）
    const moveX = moveDistance * Math.cos(Math.PI / 4);
    const moveY = -moveDistance * Math.sin(Math.PI / 4); // Y轴向上是负值
    
    this.diamond.x += moveX;
    this.diamond.y += moveY;
    
    // 可选：添加旋转效果
    this.diamond.rotation += 0.02;
  }

  createGrid() {
    // 创建网格背景以便观察相机移动
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5);
    
    const gridSize = 100;
    const worldWidth = 2000;
    const worldHeight = 2000;
    
    // 绘制垂直线
    for (let x = 0; x <= worldWidth; x += gridSize) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, worldHeight);
    }
    
    // 绘制水平线
    for (let y = 0; y <= worldHeight; y += gridSize) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(worldWidth, y);
    }
    
    gridGraphics.strokePath();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  pixelArt: false,
  antialias: true
};

new Phaser.Game(config);