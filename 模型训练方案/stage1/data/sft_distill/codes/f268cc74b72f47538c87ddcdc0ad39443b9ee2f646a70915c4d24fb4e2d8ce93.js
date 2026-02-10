class ZoomCameraScene extends Phaser.Scene {
  constructor() {
    super('ZoomCameraScene');
    this.targetZoom = 1; // 目标缩放值
    this.currentZoom = 1; // 当前缩放值
    this.isZoomedIn = false; // 缩放状态
    this.zoomSpeed = 0.05; // 缩放平滑速度
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建网格背景
    this.createGridBackground();
    
    // 创建参考物体（用于观察缩放效果）
    this.createReferenceObjects();
    
    // 创建中心十字准星
    this.createCrosshair();
    
    // 创建UI文本显示缩放信息（固定在相机上）
    this.zoomText = this.add.text(10, 10, 'Zoom: 1.00x', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0); // 固定在相机上
    this.zoomText.setDepth(1000);
    
    // 创建操作提示
    this.instructionText = this.add.text(10, 50, 'Right Click: Toggle Zoom (0.5x / 2.0x)', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setScrollFactor(0);
    this.instructionText.setDepth(1000);
    
    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.toggleZoom();
      }
    });
    
    // 禁用右键菜单
    this.input.mouse.disableContextMenu();
    
    // 获取主相机
    this.mainCamera = this.cameras.main;
  }

  createGridBackground() {
    const graphics = this.add.graphics();
    
    // 绘制网格
    graphics.lineStyle(1, 0x333333, 1);
    const gridSize = 50;
    const worldWidth = 1600;
    const worldHeight = 1200;
    
    // 垂直线
    for (let x = 0; x <= worldWidth; x += gridSize) {
      graphics.lineBetween(x, 0, x, worldHeight);
    }
    
    // 水平线
    for (let y = 0; y <= worldHeight; y += gridSize) {
      graphics.lineBetween(0, y, worldWidth, y);
    }
    
    // 绘制背景色
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(0, 0, worldWidth, worldHeight);
    graphics.setDepth(-1);
  }

  createReferenceObjects() {
    const graphics = this.add.graphics();
    
    // 创建多个彩色矩形作为参考物体
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 1000, y: 200 },
      { x: 200, y: 500 },
      { x: 600, y: 500 },
      { x: 1000, y: 500 }
    ];
    
    positions.forEach((pos, index) => {
      graphics.fillStyle(colors[index], 1);
      graphics.fillRect(pos.x, pos.y, 100, 100);
      
      // 添加边框
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeRect(pos.x, pos.y, 100, 100);
    });
    
    // 在中心绘制一个大圆
    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillCircle(800, 600, 150);
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.strokeCircle(800, 600, 150);
    
    // 添加文本标记
    const centerText = this.add.text(800, 600, 'CENTER', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    centerText.setOrigin(0.5);
  }

  createCrosshair() {
    const graphics = this.add.graphics();
    graphics.setScrollFactor(0); // 固定在屏幕中心
    graphics.setDepth(999);
    
    const centerX = 400;
    const centerY = 300;
    const size = 20;
    
    graphics.lineStyle(2, 0xff0000, 0.8);
    // 水平线
    graphics.lineBetween(centerX - size, centerY, centerX + size, centerY);
    // 垂直线
    graphics.lineBetween(centerX, centerY - size, centerX, centerY + size);
    
    // 中心点
    graphics.fillStyle(0xff0000, 0.8);
    graphics.fillCircle(centerX, centerY, 3);
  }

  toggleZoom() {
    // 切换缩放状态
    this.isZoomedIn = !this.isZoomedIn;
    
    if (this.isZoomedIn) {
      this.targetZoom = 2.0; // 放大到2倍
    } else {
      this.targetZoom = 0.5; // 缩小到0.5倍
    }
  }

  update(time, delta) {
    // 平滑过渡到目标缩放值
    if (Math.abs(this.currentZoom - this.targetZoom) > 0.01) {
      this.currentZoom = Phaser.Math.Linear(
        this.currentZoom,
        this.targetZoom,
        this.zoomSpeed
      );
      
      // 限制缩放范围在0.5-2之间
      this.currentZoom = Phaser.Math.Clamp(this.currentZoom, 0.5, 2.0);
      
      // 应用缩放到相机
      this.mainCamera.setZoom(this.currentZoom);
    }
    
    // 更新UI文本显示当前缩放值
    this.zoomText.setText(`Zoom: ${this.currentZoom.toFixed(2)}x`);
    
    // 根据缩放状态改变文本颜色
    if (this.isZoomedIn) {
      this.zoomText.setStyle({ fill: '#00ff00' });
    } else {
      this.zoomText.setStyle({ fill: '#ff6600' });
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ZoomCameraScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
new Phaser.Game(config);