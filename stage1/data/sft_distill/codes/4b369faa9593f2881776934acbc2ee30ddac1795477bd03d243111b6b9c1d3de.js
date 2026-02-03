class ZoomScene extends Phaser.Scene {
  constructor() {
    super('ZoomScene');
    this.currentZoom = 1.0; // 状态信号：当前缩放倍数
    this.zoomSpeed = 0.02; // 缩放速度
    this.minZoom = 0.5; // 最小缩放
    this.maxZoom = 2.0; // 最大缩放
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 绘制网格背景，用于观察缩放效果
    this.createGrid();
    
    // 创建一些参考物体
    this.createReferenceObjects();
    
    // 获取主相机
    this.mainCamera = this.cameras.main;
    this.mainCamera.setZoom(this.currentZoom);
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 创建文本显示当前缩放倍数
    this.zoomText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0); // 固定在屏幕上，不受相机缩放影响
    this.updateZoomText();
    
    // 添加操作提示
    const instructions = this.add.text(16, 60, 
      '上方向键: 放大\n下方向键: 缩小\n左右方向键: 平移相机', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructions.setScrollFactor(0);
  }

  createGrid() {
    const graphics = this.add.graphics();
    const gridSize = 50;
    const width = 1600;
    const height = 1200;
    
    // 绘制网格线
    graphics.lineStyle(1, 0x333333, 1);
    
    // 垂直线
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    // 水平线
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }
    
    // 绘制中心十字线（更粗）
    graphics.lineStyle(3, 0x666666, 1);
    graphics.lineBetween(width / 2, 0, width / 2, height);
    graphics.lineBetween(0, height / 2, width, height / 2);
  }

  createReferenceObjects() {
    const centerX = 800;
    const centerY = 600;
    
    // 创建中心圆
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xff0000, 1);
    centerCircle.fillCircle(centerX, centerY, 30);
    
    // 创建周围的矩形
    const colors = [0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    const positions = [
      { x: centerX - 200, y: centerY - 200 },
      { x: centerX + 200, y: centerY - 200 },
      { x: centerX - 200, y: centerY + 200 },
      { x: centerX + 200, y: centerY + 200 }
    ];
    
    positions.forEach((pos, index) => {
      const rect = this.add.graphics();
      rect.fillStyle(colors[index], 1);
      rect.fillRect(pos.x - 40, pos.y - 40, 80, 80);
      
      // 添加标签
      const label = this.add.text(pos.x, pos.y, `Object ${index + 1}`, {
        fontSize: '16px',
        fill: '#ffffff'
      });
      label.setOrigin(0.5);
    });
    
    // 创建一些随机分布的小圆点
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(100, 1500);
      const y = Phaser.Math.Between(100, 1100);
      const circle = this.add.graphics();
      circle.fillStyle(0xffffff, 0.6);
      circle.fillCircle(x, y, 10);
    }
  }

  updateZoomText() {
    this.zoomText.setText(`缩放倍数: ${this.currentZoom.toFixed(2)}x`);
  }

  update(time, delta) {
    // 处理缩放
    if (this.cursors.up.isDown) {
      // 放大
      this.currentZoom += this.zoomSpeed;
      if (this.currentZoom > this.maxZoom) {
        this.currentZoom = this.maxZoom;
      }
      this.mainCamera.setZoom(this.currentZoom);
      this.updateZoomText();
    } else if (this.cursors.down.isDown) {
      // 缩小
      this.currentZoom -= this.zoomSpeed;
      if (this.currentZoom < this.minZoom) {
        this.currentZoom = this.minZoom;
      }
      this.mainCamera.setZoom(this.currentZoom);
      this.updateZoomText();
    }
    
    // 处理相机平移（额外功能，便于观察缩放效果）
    const cameraMoveSpeed = 5;
    if (this.cursors.left.isDown) {
      this.mainCamera.scrollX -= cameraMoveSpeed;
    } else if (this.cursors.right.isDown) {
      this.mainCamera.scrollX += cameraMoveSpeed;
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ZoomScene,
  parent: 'game-container'
};

new Phaser.Game(config);