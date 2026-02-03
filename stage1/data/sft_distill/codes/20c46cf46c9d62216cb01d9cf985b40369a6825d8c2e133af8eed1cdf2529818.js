class ZoomScene extends Phaser.Scene {
  constructor() {
    super('ZoomScene');
    this.currentZoom = 1.0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 绘制网格背景，便于观察缩放效果
    const graphics = this.add.graphics();
    
    // 绘制网格线
    graphics.lineStyle(1, 0x333333, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 10);

    // 绘制一些参考物体
    const colors = [0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i;
      const x = 400 + Math.cos(angle) * 150;
      const y = 300 + Math.sin(angle) * 150;
      
      graphics.fillStyle(colors[i], 1);
      graphics.fillRect(x - 25, y - 25, 50, 50);
    }

    // 添加文字说明
    this.instructionText = this.add.text(10, 10, 
      '使用方向键 ↑↓ 控制缩放\n当前缩放: 1.00x', 
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 }
      }
    );
    this.instructionText.setScrollFactor(0); // 固定在屏幕上不随相机移动

    // 获取主相机
    this.camera = this.cameras.main;
    this.camera.setZoom(this.currentZoom);

    // 创建光标键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 缩放速度（每秒）
    this.zoomSpeed = 0.5;
    
    // 缩放范围
    this.minZoom = 0.5;
    this.maxZoom = 2.0;
  }

  update(time, delta) {
    // 计算本帧的缩放变化量（基于时间增量）
    const zoomDelta = this.zoomSpeed * (delta / 1000);

    // 按上方向键放大
    if (this.cursors.up.isDown) {
      this.currentZoom += zoomDelta;
      if (this.currentZoom > this.maxZoom) {
        this.currentZoom = this.maxZoom;
      }
      this.camera.setZoom(this.currentZoom);
    }

    // 按下方向键缩小
    if (this.cursors.down.isDown) {
      this.currentZoom -= zoomDelta;
      if (this.currentZoom < this.minZoom) {
        this.currentZoom = this.minZoom;
      }
      this.camera.setZoom(this.currentZoom);
    }

    // 更新显示文本
    this.instructionText.setText(
      `使用方向键 ↑↓ 控制缩放\n当前缩放: ${this.currentZoom.toFixed(2)}x\n范围: ${this.minZoom}x - ${this.maxZoom}x`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ZoomScene,
  parent: 'game-container'
};

new Phaser.Game(config);