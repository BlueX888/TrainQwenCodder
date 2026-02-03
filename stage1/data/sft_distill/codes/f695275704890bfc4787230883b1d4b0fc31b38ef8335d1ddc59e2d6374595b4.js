class CameraZoomScene extends Phaser.Scene {
  constructor() {
    super('CameraZoomScene');
    this.currentZoom = 1.0; // 状态信号：当前缩放倍数
  }

  preload() {
    // 无需预加载外部资源
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

    // 绘制一些彩色方块作为参考对象
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
    for (let i = 0; i < 5; i++) {
      const boxGraphics = this.add.graphics();
      boxGraphics.fillStyle(colors[i], 1);
      boxGraphics.fillRect(0, 0, 80, 80);
      
      const x = 150 + (i % 3) * 200;
      const y = 150 + Math.floor(i / 3) * 200;
      boxGraphics.setPosition(x, y);
      
      // 添加文字标签
      this.add.text(x + 40, y + 40, `Box ${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
    }

    // 创建UI文字显示（固定在屏幕上，不受相机缩放影响）
    this.zoomText = this.add.text(16, 16, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0); // 固定在屏幕上

    this.instructionText = this.add.text(16, 60, 'UP/DOWN: Zoom In/Out\nZoom Range: 0.5x - 2.0x', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    // 获取主相机
    this.camera = this.cameras.main;
    this.camera.setZoom(this.currentZoom);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 缩放参数
    this.zoomSpeed = 0.02; // 每帧缩放速度
    this.minZoom = 0.5;
    this.maxZoom = 2.0;

    // 更新显示
    this.updateZoomDisplay();
  }

  update(time, delta) {
    let zoomChanged = false;

    // 方向键上：放大（zoom增加）
    if (this.cursors.up.isDown) {
      this.currentZoom += this.zoomSpeed;
      zoomChanged = true;
    }

    // 方向键下：缩小（zoom减少）
    if (this.cursors.down.isDown) {
      this.currentZoom -= this.zoomSpeed;
      zoomChanged = true;
    }

    // 限制缩放范围
    if (zoomChanged) {
      this.currentZoom = Phaser.Math.Clamp(this.currentZoom, this.minZoom, this.maxZoom);
      this.camera.setZoom(this.currentZoom);
      this.updateZoomDisplay();
    }
  }

  updateZoomDisplay() {
    // 更新缩放倍数显示
    const zoomPercent = Math.round(this.currentZoom * 100);
    this.zoomText.setText(`Zoom: ${this.currentZoom.toFixed(2)}x (${zoomPercent}%)`);
    
    // 根据缩放级别改变文字颜色
    if (this.currentZoom <= this.minZoom) {
      this.zoomText.setColor('#ff6b6b'); // 最小值时显示红色
    } else if (this.currentZoom >= this.maxZoom) {
      this.zoomText.setColor('#4ecdc4'); // 最大值时显示青色
    } else {
      this.zoomText.setColor('#ffffff'); // 正常范围显示白色
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: CameraZoomScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);