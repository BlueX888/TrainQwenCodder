class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomCount = 0; // 可验证的状态信号
    this.isZooming = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制网格背景作为缩放参照
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制垂直线
    for (let x = 0; x <= width; x += 50) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    // 绘制水平线
    for (let y = 0; y <= height; y += 50) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中心方块
    const centerSquare = this.add.graphics();
    centerSquare.fillStyle(0xff6600, 1);
    centerSquare.fillRect(width / 2 - 50, height / 2 - 50, 100, 100);
    
    // 绘制中心圆
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0x00ff00, 1);
    centerCircle.fillCircle(width / 2, height / 2, 30);

    // 添加提示文本
    this.instructionText = this.add.text(20, 20, 'Press SPACE to zoom camera', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setScrollFactor(0); // 固定在屏幕上不随相机移动

    // 添加状态文本
    this.statusText = this.add.text(20, 60, this.getStatusText(), {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      if (!this.isZooming) {
        this.triggerZoom();
      }
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;
  }

  triggerZoom() {
    this.isZooming = true;
    this.zoomCount++;
    
    // 更新状态文本
    this.statusText.setText(this.getStatusText());

    // 随机选择缩放级别（放大或缩小）
    const zoomLevels = [0.5, 1.5, 2.0, 0.75];
    const targetZoom = zoomLevels[this.zoomCount % zoomLevels.length];

    // 触发缩放效果，持续 1000 毫秒（1秒）
    this.mainCamera.zoomTo(targetZoom, 1000, 'Sine.easeInOut', false, (camera, progress) => {
      // 缩放完成回调
      if (progress === 1) {
        // 缩放完成后，再缩放回 1.0
        this.mainCamera.zoomTo(1.0, 1000, 'Sine.easeInOut', false, (cam, prog) => {
          if (prog === 1) {
            this.isZooming = false;
          }
        });
      }
    });

    console.log(`Zoom triggered! Count: ${this.zoomCount}, Target zoom: ${targetZoom}`);
  }

  getStatusText() {
    return `Zoom Count: ${this.zoomCount} | Zooming: ${this.isZooming ? 'YES' : 'NO'}`;
  }

  update(time, delta) {
    // 实时更新状态（如果需要显示动态信息）
    if (this.isZooming) {
      this.statusText.setText(
        `Zoom Count: ${this.zoomCount} | Zooming: YES | Current Zoom: ${this.mainCamera.zoom.toFixed(2)}`
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);